"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Employee, ScheduleHistory } from "@/types/types";
import { getRandomColor } from "@/lib/utils";

interface DayScheduleProps {
  date: string;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateHistory: (
    updater: (prev: ScheduleHistory[]) => ScheduleHistory[]
  ) => void;
}

const LUNCH_ICON = "🍽️";
const RANDOM_BREAK_ICON = "⚠️";

export default function DaySchedule({
  date,
  employees,
  onUpdateEmployees,
  onUpdateHistory,
}: DayScheduleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<number | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<number | null>(null);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const promptForBreakReason = () => {
    return window.prompt("What is the reason for this emergency break?", "");
  };

  const handleMouseDown = (
    employeeIndex: number,
    hourIndex: number,
    isHalfHour: boolean
  ) => {
    const cellIndex = hourIndex * 2 + (isHalfHour ? 1 : 0);
    const employee = employees[employeeIndex];
    const newEmployees = [...employees];

    if (employee.schedule) {
      const isWithinSchedule =
        cellIndex >= employee.schedule.start &&
        cellIndex <= employee.schedule.end;

      if (isWithinSchedule) {
        const scheduleStatus = isScheduled(employee, hourIndex, isHalfHour);
        
        // Si no hay lunch break, establecerlo primero
        if (!employee.schedule.lunchBreak) {
          newEmployees[employeeIndex] = {
            ...employee,
            schedule: {
              ...employee.schedule,
              lunchBreak: {
                start: cellIndex,
                end: cellIndex,
              },
            },
            hours: employee.hours - 0.5,
          };
          onUpdateEmployees(newEmployees);
          return;
        }

        // Si el slot ya está ocupado, no hacer nada
        if (scheduleStatus.isLunch || scheduleStatus.isRandomBreak) {
          return;
        }

        // Si ya hay lunch break, permitir random breaks
        const reason = promptForBreakReason();
        if (!reason) return;

        const randomBreak = {
          start: cellIndex,
          end: cellIndex,
          reason,
        };

        newEmployees[employeeIndex] = {
          ...employee,
          schedule: {
            ...employee.schedule,
            randomBreaks: [
              ...(employee.schedule.randomBreaks || []),
              randomBreak,
            ],
          },
          hours: employee.hours - 0.5,
        };

        onUpdateEmployees(newEmployees);
        return;
      }
    }

    // Si no hay horario o estamos fuera del rango, manejamos la selección normal
    if (
      employee.schedule?.start === cellIndex &&
      employee.schedule?.end === cellIndex
    ) {
      newEmployees[employeeIndex] = {
        ...employee,
        schedule: undefined,
        hours: 0,
      };
    } else {
      const color = employee.defaultColor || getRandomColor();
      newEmployees[employeeIndex] = {
        ...employee,
        schedule: {
          start: cellIndex,
          end: cellIndex,
          color,
        },
        hours: 0.5,
      };
    }

    onUpdateEmployees(newEmployees);
    setIsDragging(true);
    setStartCell(cellIndex);
    setCurrentEmployee(employeeIndex);
  };

  const handleMouseMove = (hourIndex: number, isHalfHour: boolean) => {
    if (isDragging && currentEmployee !== null && startCell !== null) {
      const currentCell = hourIndex * 2 + (isHalfHour ? 1 : 0);
      if (currentCell !== startCell) {
        updateEmployeeSchedule(currentEmployee, startCell, currentCell);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && currentEmployee !== null && startCell !== null) {
      const previousSchedule = employees[currentEmployee].schedule;
      onUpdateHistory((prevHistory) => [
        ...prevHistory,
        {
          timestamp: new Date(),
          employeeIndex: currentEmployee,
          previousSchedule,
          newSchedule: employees[currentEmployee].schedule,
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

    const employee = employees[employeeIndex];
    const previousSchedule = employee.schedule;
    const newSchedule = {
      start: startCell,
      end: endCell,
      color: employee.defaultColor || getRandomColor(),
    };

    const hours = (endCell - startCell + 1) / 2;

    newEmployees[employeeIndex] = {
      ...newEmployees[employeeIndex],
      schedule: newSchedule,
      hours,
    };

    onUpdateEmployees(newEmployees);
    onUpdateHistory((prevHistory) => [
      ...prevHistory,
      {
        timestamp: new Date(),
        employeeIndex,
        previousSchedule,
        newSchedule,
      },
    ]);
  };

  const clearEmployeeSchedule = (employeeIndex: number) => {
    const newEmployees = [...employees];

    newEmployees[employeeIndex] = {
      ...newEmployees[employeeIndex],
      schedule: undefined,
      hours: 0,
    };
    onUpdateEmployees(newEmployees);
  };

  const calculateTotalHours = () => {
    return employees.reduce((total, employee) => total + employee.hours, 0);
  };

  const isScheduled = (
    employee: Employee,
    hourIndex: number,
    isHalfHour: boolean
  ) => {
    if (!employee.schedule)
      return { isScheduled: false, isLunch: false, isRandomBreak: false };

    const cellIndex = hourIndex * 2 + (isHalfHour ? 1 : 0);

    // Verificar random breaks
    if (employee.schedule.randomBreaks) {
      const randomBreak = employee.schedule.randomBreaks.find(
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
    if (employee.schedule.lunchBreak) {
      const { start, end } = employee.schedule.lunchBreak;
      if (cellIndex >= start && cellIndex <= end) {
        return { isScheduled: true, isLunch: true, isRandomBreak: false };
      }
    }

    return {
      isScheduled:
        cellIndex >= employee.schedule.start &&
        cellIndex <= employee.schedule.end,
      isLunch: false,
      isRandomBreak: false,
    };
  };

  return (
    <Card className="p-6 select-none max-w-[1200px] mx-auto">
      <div className="mb-4 text-lg font-medium border-b pb-2">{date}</div>
      <div className="mb-4 text-sm flex items-center gap-4 text-gray-600 bg-gray-50 p-2 rounded">
        <span className="flex items-center gap-1">
          <div className="w-6 h-6 border flex items-center justify-center text-base">
            {LUNCH_ICON}
          </div>
          <span>Lunch break</span>
        </span>
        <span className="flex items-center gap-1">
          <div className="w-6 h-6 border flex items-center justify-center text-base">
            {RANDOM_BREAK_ICON}
          </div>
          <span>Emergency break</span>
        </span>
        <span className="text-xs italic">
          (First select lunch break, then you can mark emergency breaks for unexpected situations)
        </span>
      </div>
      <div className="grid gap-0">
        <div className="grid grid-cols-[200px,1fr,auto]">
          <div className="font-medium px-2 py-1 border">Tages-pensum</div>
          <div className="grid grid-rows-2 gap-0">
            <div className="grid grid-cols-12 gap-0">
              {hours.slice(0, -1).map((hour) => (
                <div key={hour} className="text-center text-sm border py-1">
                  {hour}:00
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-0">
              {hours.slice(1).map((hour) => (
                <div key={hour} className="text-center text-sm border py-1">
                  {hour}:00
                </div>
              ))}
            </div>
          </div>
          <div className="w-8"></div>
        </div>

        {employees.map((employee, employeeIndex) => (
          <div
            key={employeeIndex}
            className="grid grid-cols-[200px,1fr,auto] items-center"
          >
            <div className="grid grid-cols-2 gap-4 px-2 py-1 border">
              <div className="bg-[#f5d6ba] px-2 py-1 truncate">
                {employee.name}
              </div>
              <div className="text-right">{employee.hours.toFixed(2)}</div>
            </div>
            <div
              className="grid grid-cols-12 gap-0 h-8"
              onMouseLeave={handleMouseUp}
            >
              {Array.from({ length: 12 }).map((_, hourIndex) => (
                <div
                  key={hourIndex}
                  className="relative h-full grid grid-cols-2"
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
                        backgroundColor: employee.schedule?.color,
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
                      backgroundColor: (() => {
                        const { isScheduled: isSlotScheduled, isLunch } =
                          isScheduled(employee, hourIndex, true);
                        if (isLunch) return "#FFFFFF";
                        return isSlotScheduled
                          ? employee.schedule?.color
                          : "#fff";
                      })(),
                      ...(isScheduled(employee, hourIndex, true).isLunch && {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "8px",
                      }),
                    }}
                    onMouseDown={() =>
                      handleMouseDown(employeeIndex, hourIndex, true)
                    }
                    onMouseMove={() => handleMouseMove(hourIndex, true)}
                    onMouseUp={handleMouseUp}
                  >
                    {isScheduled(employee, hourIndex, true).isLunch &&
                      LUNCH_ICON}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => clearEmployeeSchedule(employeeIndex)}
              className="p-1 bg-red-500 text-white rounded w-8 h-8 flex items-center justify-center ml-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right font-medium">
        Total Hours: {calculateTotalHours().toFixed(2)}
      </div>
    </Card>
  );
}
