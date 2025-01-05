"use client";

import { Employee, ScheduleHistory } from "@/types/types";
import DaySchedule from "./DaySchedule";
import { format, addDays, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

interface WeeklyScheduleProps {
  selectedDate: Date;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateHistory: (updater: (prev: ScheduleHistory[]) => ScheduleHistory[]) => void;
  onNavigateToMonth: () => void;
}

export default function WeeklySchedule({
  selectedDate,
  employees,
  onUpdateEmployees,
  onUpdateHistory,
  onNavigateToMonth
}: WeeklyScheduleProps) {
  const weekStart = startOfWeek(selectedDate, { locale: es });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Semana del {format(weekStart, "dd/MM/yyyy", { locale: es })}
        </h2>
        <button
          onClick={onNavigateToMonth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver al Calendario
        </button>
      </div>
      
      <div className="space-y-4">
        {weekDays.map((date) => (
          <DaySchedule
            key={date.toISOString()}
            date={date}
            employees={employees}
            onUpdateEmployees={onUpdateEmployees}
            onUpdateHistory={onUpdateHistory}
          />
        ))}
      </div>
    </div>
  );
} 