"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Employee, ScheduleHistory } from "@/types/types";

interface DayScheduleProps {
  date: string;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateHistory: (updater: (prev: ScheduleHistory[]) => ScheduleHistory[]) => void;
}

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

  const handleMouseDown = (
    employeeIndex: number,
    hourIndex: number,
    isHalfHour: boolean
  ) => {
    const cellIndex = hourIndex * 2 + (isHalfHour ? 1 : 0);
    
    setIsDragging(true);
    setStartCell(cellIndex);
    setCurrentEmployee(employeeIndex);
  };

  const handleMouseMove = (hourIndex: number, isHalfHour: boolean) => {
    if (isDragging && currentEmployee !== null && startCell !== null) {
      const currentCell = hourIndex * 2 + (isHalfHour ? 1 : 0);
      updateEmployeeSchedule(currentEmployee, startCell, currentCell);
    }
  };

  const handleMouseUp = () => {
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

    const previousSchedule = employees[employeeIndex].schedule;
    const newSchedule = {
      start: startCell,
      end: endCell,
      color: employees[employeeIndex].schedule?.color || "bg-blue-500",
      lunchStart: undefined,
      lunchEnd: undefined
    };

    const hours = (endCell - startCell + 1) / 2;

    newEmployees[employeeIndex] = {
      ...newEmployees[employeeIndex],
      schedule: newSchedule,
      hours
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

  const getScheduleStatus = (employee: Employee, hourIndex: number) => {
    if (!employee.schedule || !employee.schedule.start || !employee.schedule.end)
      return { isScheduledFull: false, isScheduledHalf: false, isLunch: false };

    const cellIndex = hourIndex * 2;
    const isLunch = employee.schedule.lunchStart !== undefined && 
      (cellIndex === employee.schedule.lunchStart || 
       cellIndex === employee.schedule.lunchEnd);

    const isScheduledFull =
      hourIndex * 2 >= employee.schedule.start &&
      hourIndex * 2 + 1 <= employee.schedule.end;

    const isScheduledHalf =
      hourIndex * 2 === employee.schedule.start ||
      hourIndex * 2 + 1 === employee.schedule.end;

    return { isScheduledFull, isScheduledHalf, isLunch };
  };

  return (
    <Card className="p-6 select-none max-w-[1200px] mx-auto">
      <div className="mb-4 text-lg font-medium border-b pb-2">{date}</div>
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
                <div key={hourIndex} className="relative h-full grid grid-cols-2">
                  <div
                    className={`border ${
                      employee.schedule?.start !== undefined && (
                        getScheduleStatus(employee, hourIndex).isScheduledFull ||
                        (getScheduleStatus(employee, hourIndex).isScheduledHalf &&
                          hourIndex * 2 >= employee.schedule.start)
                      )
                        ? employee.schedule.color
                        : "bg-white"
                    } cursor-pointer hover:bg-gray-100`}
                    onMouseDown={() =>
                      handleMouseDown(employeeIndex, hourIndex, false)
                    }
                    onMouseMove={() => handleMouseMove(hourIndex, false)}
                    onMouseUp={handleMouseUp}
                  />
                  <div
                    className={`border ${
                      employee.schedule?.start !== undefined && (
                        getScheduleStatus(employee, hourIndex).isScheduledFull ||
                        (getScheduleStatus(employee, hourIndex).isScheduledHalf &&
                          hourIndex * 2 + 1 <= employee.schedule.end)
                      )
                        ? employee.schedule.color
                        : "bg-white"
                    } cursor-pointer hover:bg-gray-100`}
                    onMouseDown={() =>
                      handleMouseDown(employeeIndex, hourIndex, true)
                    }
                    onMouseMove={() => handleMouseMove(hourIndex, true)}
                    onMouseUp={handleMouseUp}
                  />
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
