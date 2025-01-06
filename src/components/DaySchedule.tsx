"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Employee, ScheduleHistory, type DaySchedule } from "@/types/types";
import { getRandomColor } from "@/lib/utils";
import BreakReasonDialog from "@/components/BreakReasonDialog";
import { useTranslations } from "next-intl";

interface DayScheduleProps {
  date: Date;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateHistory: (
    updater: (prev: ScheduleHistory[]) => ScheduleHistory[]
  ) => void;
  isReadOnly?: boolean;
  locale?: string;
}

const LUNCH_ICON = "🍽️";
const RANDOM_BREAK_ICON = "⚠️";

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DaySchedule({
  date,
  employees,
  onUpdateEmployees,
  onUpdateHistory,
  isReadOnly = false,
  locale,
}: DayScheduleProps) {
  const t = useTranslations();
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<number | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<number | null>(null);
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [pendingBreakAction, setPendingBreakAction] = useState<{
    employeeIndex: number;
    cellIndex: number;
  } | null>(null);
  const [lastClickedCell, setLastClickedCell] = useState<{
    employeeIndex: number;
    cellIndex: number;
  } | null>(null);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const handleBreakDialogConfirm = (reason: string) => {
    if (pendingBreakAction && reason) {
      const { employeeIndex, cellIndex } = pendingBreakAction;
      const employee = employees[employeeIndex];
      const dateKey = getDateKey(date);
      const currentSchedule = employee.schedules?.[dateKey];

      if (currentSchedule) {
        const newSchedule: DaySchedule = {
          ...currentSchedule,
          randomBreaks: [
            ...(currentSchedule.randomBreaks || []),
            { start: cellIndex, end: cellIndex, reason },
          ],
          hours: currentSchedule.hours - 0.5,
        };

        const newEmployees = [...employees];
        newEmployees[employeeIndex] = {
          ...employee,
          schedules: {
            ...(employee.schedules || {}),
            [dateKey]: newSchedule,
          },
        };

        onUpdateEmployees(newEmployees);
      }
    }
    setIsBreakDialogOpen(false);
    setPendingBreakAction(null);
  };

  const handleMouseDown = (
    employeeIndex: number,
    hourIndex: number,
    isHalfHour: boolean
  ) => {
    if (isReadOnly) return;
    const cellIndex = hourIndex * 2 + (isHalfHour ? 1 : 0);
    const dateKey = getDateKey(date);
    const employee = employees[employeeIndex];
    const currentSchedule = employee.schedules[dateKey];
    const newEmployees = [...employees];

    if (
      lastClickedCell && 
      lastClickedCell.employeeIndex === employeeIndex && 
      !isDragging
    ) {
      const start = Math.min(lastClickedCell.cellIndex, cellIndex);
      const end = Math.max(lastClickedCell.cellIndex, cellIndex);
      updateEmployeeSchedule(employeeIndex, start, end);
      
      onUpdateHistory((prevHistory) => [
        ...prevHistory,
        {
          timestamp: new Date(),
          employeeIndex,
          previousSchedule: currentSchedule,
          newSchedule: employees[employeeIndex].schedules?.[dateKey],
        },
      ]);
      
      setLastClickedCell(null);
      return;
    }

    if (currentSchedule) {
      const isWithinSchedule =
        cellIndex >= currentSchedule.start && cellIndex <= currentSchedule.end;

      if (isWithinSchedule) {
        const scheduleStatus = isScheduled(employee, hourIndex, isHalfHour);

        if (!currentSchedule.lunchBreak) {
          newEmployees[employeeIndex] = {
            ...employee,
            schedules: {
              ...employee.schedules,
              [dateKey]: {
                ...currentSchedule,
                lunchBreak: {
                  start: cellIndex,
                  end: cellIndex,
                },
                hours: currentSchedule.hours - 0.5,
              },
            },
          };
          onUpdateEmployees(newEmployees);
          return;
        } else if (!scheduleStatus.isLunch && !scheduleStatus.isRandomBreak) {
          setPendingBreakAction({ employeeIndex, cellIndex });
          setIsBreakDialogOpen(true);
          return;
        }
      }
    }

    const newSchedule: DaySchedule = {
      start: cellIndex,
      end: cellIndex,
      color: employee.defaultColor || getRandomColor(),
      hours: 0.5,
      lunchBreak: undefined,
      randomBreaks: [],
    };

    newEmployees[employeeIndex] = {
      ...employee,
      schedules: {
        ...employee.schedules,
        [dateKey]: newSchedule,
      },
    };

    onUpdateEmployees(newEmployees);
    setLastClickedCell({ employeeIndex, cellIndex });
    setIsDragging(true);
    setStartCell(cellIndex);
    setCurrentEmployee(employeeIndex);
  };

  const handleMouseMove = (hourIndex: number, isHalfHour: boolean) => {
    if (isDragging && currentEmployee !== null && startCell !== null) {
      const currentCell = hourIndex * 2 + (isHalfHour ? 1 : 0);
      if (currentCell !== startCell) {
        updateEmployeeSchedule(currentEmployee, startCell, currentCell);
        setLastClickedCell(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && currentEmployee !== null && startCell !== null) {
      const dateKey = getDateKey(date);
      const previousSchedule = employees[currentEmployee].schedules?.[dateKey];
      onUpdateHistory((prevHistory) => [
        ...prevHistory,
        {
          timestamp: new Date(),
          employeeIndex: currentEmployee,
          previousSchedule,
          newSchedule: employees[currentEmployee].schedules?.[dateKey],
        },
      ]);
    }
    setIsDragging(false);
    setStartCell(null);
    setCurrentEmployee(null);
  };

  const updateEmployeeSchedule = (
    employeeIndex: number,
    start: number,
    end: number
  ) => {
    const newEmployees = [...employees];
    const startCell = Math.min(start, end);
    const endCell = Math.max(start, end);
    const hours = (endCell - startCell + 1) / 2;
    const employee = employees[employeeIndex];
    const dateKey = getDateKey(date);

    const newSchedule: DaySchedule = {
      start: startCell,
      end: endCell,
      color: employee.defaultColor || getRandomColor(),
      hours,
      lunchBreak: undefined,
      randomBreaks: [],
    };

    newEmployees[employeeIndex] = {
      ...employee,
      schedules: {
        ...employee.schedules,
        [dateKey]: newSchedule,
      },
    };

    onUpdateEmployees(newEmployees);
  };

  const clearEmployeeSchedule = (employeeIndex: number) => {
    const newEmployees = [...employees];
    const employee = newEmployees[employeeIndex];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [getDateKey(date)]: removed, ...remainingSchedules } =
      employee.schedules;

    newEmployees[employeeIndex] = {
      ...employee,
      schedules: remainingSchedules,
    };

    onUpdateEmployees(newEmployees);
  };

  const calculateTotalHours = () => {
    const dateKey = getDateKey(date);
    return employees.reduce((total, employee) => {
      return total + (employee.schedules?.[dateKey]?.hours || 0);
    }, 0);
  };

  const isScheduled = (
    employee: Employee,
    hourIndex: number,
    isHalfHour: boolean
  ) => {
    const dateKey = getDateKey(date);
    const schedule = employee.schedules?.[dateKey];

    if (!schedule)
      return { isScheduled: false, isLunch: false, isRandomBreak: false };

    const cellIndex = hourIndex * 2 + (isHalfHour ? 1 : 0);

    // Verificar random breaks
    if (schedule.randomBreaks) {
      const randomBreak = schedule.randomBreaks.find(
        (rb) => cellIndex >= rb.start && cellIndex <= rb.end
      );
      if (randomBreak) {
        return {
          isScheduled: true,
          isLunch: false,
          isRandomBreak: true,
          breakReason: randomBreak.reason,
        };
      }
    }

    // Verificar lunch break
    if (schedule.lunchBreak) {
      const { start, end } = schedule.lunchBreak;
      if (cellIndex >= start && cellIndex <= end) {
        return { isScheduled: true, isLunch: true, isRandomBreak: false };
      }
    }

    return {
      isScheduled: cellIndex >= schedule.start && cellIndex <= schedule.end,
      isLunch: false,
      isRandomBreak: false,
    };
  };

  return (
    <>
      <Card className="p-3 sm:p-6 select-none max-w-[1200px] mx-auto">
        <div className="mb-4 text-lg font-medium border-b pb-2">
          {date.toLocaleDateString(locale || t("locale"), {
            weekday: "long",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </div>
        <div className="mb-4 text-base font-medium bg-blue-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{t("schedule.daily_quota")}</span>
            <span>{calculateTotalHours().toFixed(2)}h</span>
          </div>
        </div>
        <div className="mb-4 text-sm flex flex-wrap items-center gap-4 text-gray-600 bg-gray-50 p-2 rounded">
          <span className="flex items-center gap-1">
            <div className="w-6 h-6 border flex items-center justify-center text-base">
              {LUNCH_ICON}
            </div>
            <span>{t("schedule.lunch_break")}</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-6 h-6 border flex items-center justify-center text-base">
              {RANDOM_BREAK_ICON}
            </div>
            <span>{t("schedule.emergency_break")}</span>
          </span>
          <span className="text-xs italic">
            {t("schedule.break_instruction")}
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[1fr] sm:grid-cols-[200px,1fr,32px]">
            <div className="hidden sm:block font-medium px-2 py-1 border"></div>

            <div className="grid grid-rows-2 gap-0">
              <div className="grid grid-cols-12 gap-0">
                {hours.slice(0, -1).map((hour) => (
                  <div key={hour} className="text-center text-xs sm:text-sm border py-1">
                    <span className="sm:hidden">{String(hour).padStart(2, '0')}</span>
                    <span className="hidden sm:inline">{String(hour).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-12 gap-0">
                {hours.slice(1).map((hour) => (
                  <div key={hour} className="text-center text-xs sm:text-sm border py-1">
                    <span className="sm:hidden">{String(hour).padStart(2, '0')}</span>
                    <span className="hidden sm:inline">{String(hour).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden sm:block w-8"></div>
          </div>

          <div className="space-y-4 sm:space-y-0">
            {employees.map((employee, employeeIndex) => {
              const dateKey = getDateKey(date);
              const schedule = employee.schedules?.[dateKey];
              return (
                <div key={employeeIndex} className="relative">
                  <div className="flex items-start">
                    <div className="flex flex-col sm:grid sm:grid-cols-[200px,1fr] w-full">
                      <div className="mb-2 sm:mb-0 bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 px-2 py-1 border w-full">
                            <div className="bg-[#f5d6ba] px-2 py-1 truncate">
                              {employee.name}
                            </div>
                            <div className="text-right">
                              {schedule?.hours ? `${schedule.hours.toFixed(2)}h` : '0h'}
                            </div>
                          </div>
                          {!isReadOnly && (
                            <button
                              onClick={() => clearEmployeeSchedule(employeeIndex)}
                              className="p-1 bg-red-500 text-white rounded w-8 h-8 flex items-center justify-center shrink-0 sm:hidden"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-0 h-8 w-full">
                        {Array.from({ length: 12 }).map((_, hourIndex) => (
                          <div
                            key={hourIndex}
                            className="relative h-full grid grid-cols-2 col-span-1"
                          >
                            <div
                              className="border cursor-pointer relative"
                              style={{
                                backgroundColor: "#FFFFFF",
                                ...(isScheduled(employee, hourIndex, false).isLunch && {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  padding: 0,
                                }),
                                ...(isScheduled(employee, hourIndex, false).isRandomBreak && {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  padding: 0,
                                }),
                                ...(isScheduled(employee, hourIndex, false).isScheduled &&
                                  !isScheduled(employee, hourIndex, false).isLunch &&
                                  !isScheduled(employee, hourIndex, false).isRandomBreak && {
                                    backgroundColor: employee.schedules?.[dateKey]?.color,
                                  }),
                              }}
                              onMouseDown={() => handleMouseDown(employeeIndex, hourIndex, false)}
                              onMouseMove={() => handleMouseMove(hourIndex, false)}
                              onMouseUp={handleMouseUp}
                              title={(() => {
                                const status = isScheduled(employee, hourIndex, false);
                                return status.isRandomBreak ? status.breakReason : "";
                              })()}
                            >
                              {isScheduled(employee, hourIndex, false).isLunch && LUNCH_ICON}
                              {isScheduled(employee, hourIndex, false).isRandomBreak && RANDOM_BREAK_ICON}
                            </div>
                            <div
                              className="border cursor-pointer relative"
                              style={{
                                backgroundColor: "#FFFFFF",
                                ...(isScheduled(employee, hourIndex, true).isLunch && {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  padding: 0,
                                }),
                                ...(isScheduled(employee, hourIndex, true).isRandomBreak && {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  padding: 0,
                                }),
                                ...(isScheduled(employee, hourIndex, true).isScheduled &&
                                  !isScheduled(employee, hourIndex, true).isLunch &&
                                  !isScheduled(employee, hourIndex, true).isRandomBreak && {
                                    backgroundColor: employee.schedules?.[dateKey]?.color,
                                  }),
                              }}
                              onMouseDown={() => handleMouseDown(employeeIndex, hourIndex, true)}
                              onMouseMove={() => handleMouseMove(hourIndex, true)}
                              onMouseUp={handleMouseUp}
                              title={(() => {
                                const status = isScheduled(employee, hourIndex, true);
                                return status.isRandomBreak ? status.breakReason : "";
                              })()}
                            >
                              {isScheduled(employee, hourIndex, true).isLunch && LUNCH_ICON}
                              {isScheduled(employee, hourIndex, true).isRandomBreak && RANDOM_BREAK_ICON}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {!isReadOnly && (
                      <button
                        onClick={() => clearEmployeeSchedule(employeeIndex)}
                        className="hidden sm:block p-1 bg-red-500 text-white rounded w-8 h-8"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      <BreakReasonDialog
        isOpen={isBreakDialogOpen}
        onClose={() => {
          setIsBreakDialogOpen(false);
          setPendingBreakAction(null);
        }}
        onConfirm={handleBreakDialogConfirm}
      />
    </>
  );
}
