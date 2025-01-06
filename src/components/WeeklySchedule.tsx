"use client";

import { Employee, ScheduleHistory } from "@/types/types";
import DaySchedule from "./DaySchedule";
import { format, addDays, startOfWeek } from "date-fns";
import { enUS, es, de } from "date-fns/locale";
import { useTranslations } from 'next-intl';

interface WeeklyScheduleProps {
  selectedDate: Date;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateHistory: (updater: (prev: ScheduleHistory[]) => ScheduleHistory[]) => void;
  isReadOnly?: boolean;
}

export default function WeeklySchedule({
  selectedDate,
  employees,
  onUpdateEmployees,
  onUpdateHistory,
  isReadOnly = false,
}: WeeklyScheduleProps) {
  const t = useTranslations();
  
  const locales = {
    'en-US': enUS,
    'es-ES': es,
    'de-DE': de
  };
  
  const locale = locales[t('locale') as keyof typeof locales];
  const weekStart = startOfWeek(selectedDate, { locale });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t('calendar.week_header', {
            date: format(weekStart, "dd/MM/yyyy", { locale: es })
          })}
        </h2>
      </div>
      
      <div className="space-y-4">
        {weekDays.map((date) => (
          <DaySchedule
            key={date.toISOString()}
            date={date}
            employees={employees}
            onUpdateEmployees={onUpdateEmployees}
            onUpdateHistory={onUpdateHistory}
            isReadOnly={isReadOnly}
            locale={t('locale')}
          />
        ))}
      </div>
    </div>
  );
} 