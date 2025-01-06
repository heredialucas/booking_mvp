"use client";

import { Card } from "@/components/ui/card";
import { ScheduleHistory, DaySchedule, Employee } from "@/types/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CopyScheduleDialog } from "@/components/CopyScheduleDialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type ViewType = "day" | "week" | "month";

interface GroupedSchedule {
  startDate: Date;
  endDate: Date;
  employeeIndex: number;
  schedules: { [key: string]: DaySchedule };
}

interface HistoryPanelProps {
  history: ScheduleHistory[];
  employees: Employee[];
  onCopySchedule: (schedule: DaySchedule, employees: number[], dates: Date[]) => void;
}

export default function HistoryPanel({
  history,
  employees,
  onCopySchedule,
}: HistoryPanelProps) {
  const t = useTranslations();
  const [storedEmployees, setStoredEmployees] = useLocalStorage('employees', employees);
  const [storedHistory, setStoredHistory] = useLocalStorage<ScheduleHistory[]>('scheduleHistory', []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewType, setViewType] = useState<ViewType>("day");
  const [selectedSchedules, setSelectedSchedules] =
    useState<GroupedSchedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (history.length > 0 && JSON.stringify(history) !== JSON.stringify(storedHistory)) {
      setStoredHistory(history);
    }
  }, [history, storedHistory, setStoredHistory]);

  useEffect(() => {
    setStoredEmployees(employees);
  }, [employees, setStoredEmployees]);

  const groupedData = useMemo(() => {
    const grouped: { [key: string]: GroupedSchedule } = {};

    storedHistory.forEach((entry) => {
      if (!entry.newSchedule) return;

      try {
        const employee = storedEmployees[entry.employeeIndex];
        if (!employee) return;

        const scheduleDate = Object.keys(entry.newSchedule)[0];
        const scheduleData = entry.newSchedule[scheduleDate];

        if (!scheduleDate || !scheduleData) return;

        const [year, month, day] = scheduleDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        let key = `${entry.employeeIndex}-${scheduleDate}`;
        let startDate = date;
        let endDate = date;

        if (viewType === "week") {
          startDate = new Date(date);
          startDate.setDate(date.getDate() - date.getDay());
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          key = `${entry.employeeIndex}-${startDate.toISOString().split('T')[0]}`;
        } else if (viewType === "month") {
          startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          key = `${entry.employeeIndex}-${date.getFullYear()}-${date.getMonth()}`;
        }

        if (!grouped[key]) {
          grouped[key] = {
            startDate,
            endDate,
            employeeIndex: entry.employeeIndex,
            schedules: {},
          };
        }

        const existingSchedule = grouped[key].schedules[scheduleDate];
        if (!existingSchedule || scheduleData.hours > existingSchedule.hours) {
          grouped[key].schedules = {
            ...grouped[key].schedules,
            [scheduleDate]: scheduleData
          };
        }

      } catch (error) {
        console.error('Error processing entry:', error);
      }
    });

    return Object.values(grouped);
  }, [storedHistory, viewType, storedEmployees]);

  const columnHelper = createColumnHelper<GroupedSchedule>();

  const columns = [
    columnHelper.accessor("startDate", {
      header: t("history.period"),
      cell: (info) => {
        const start = info.getValue().toLocaleDateString();
        const end = info.row.original.endDate.toLocaleDateString();
        return viewType === "day" ? start : `${start} - ${end}`;
      },
    }),
    columnHelper.accessor("employeeIndex", {
      header: t("history.employee"),
      cell: (info) => storedEmployees[info.getValue()].name,
    }),
    columnHelper.accessor("schedules", {
      header: t("history.schedules"),
      cell: (info) => {
        const schedules = info.getValue();
        const totalHours = Object.values(schedules).reduce((total, schedule) => {
          return total + schedule.hours;
        }, 0);

        switch (viewType) {
          case "day":
            return `${t("history.daily_hours", { hours: totalHours.toFixed(1) })}`;
          
          case "week":
            const avgHoursPerDay = totalHours / 7;
            return `${t("history.weekly_hours", { 
              total: totalHours.toFixed(1), 
              average: avgHoursPerDay.toFixed(1) 
            })}`;
          
          case "month":
            const daysInMonth = new Date(
              info.row.original.endDate.getFullYear(),
              info.row.original.endDate.getMonth() + 1,
              0
            ).getDate();
            const avgHoursPerDayMonth = totalHours / daysInMonth;
            return `${t("history.monthly_hours", { 
              total: totalHours.toFixed(1), 
              average: avgHoursPerDayMonth.toFixed(1),
              days: daysInMonth
            })}`;
        }
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <button
          onClick={() => {
            console.log('Selected for copy:', info.row.original);
            setSelectedSchedules(info.row.original);
            setIsDialogOpen(true);
          }}
          className="px-2 py-1 bg-green-500 text-white rounded text-sm"
        >
          {t("history.copy")}
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: groupedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">{t("history.title")}</h2>
        <select
          value={viewType}
          onChange={(e) => setViewType(e.target.value as ViewType)}
          className="border rounded px-2 py-1"
        >
          <option value="day">{t("history.daily_view")}</option>
          <option value="week">{t("history.weekly_view")}</option>
          <option value="month">{t("history.monthly_view")}</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left bg-gray-100 cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSchedules && (
        <CopyScheduleDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          schedules={selectedSchedules.schedules}
          employees={storedEmployees}
          viewType={viewType}
          startDate={selectedSchedules.startDate}
          onCopy={(selectedEmployees, targetDate) => {
            const schedules = selectedSchedules.schedules;
            console.log('Copying schedules:', {
              schedules,
              selectedEmployees,
              targetDate,
              viewType
            });
            
            selectedEmployees.forEach(employeeId => {
              switch (viewType) {
                case "day":
                  const scheduleDate = Object.keys(schedules)[0];
                  const daySchedule = schedules[scheduleDate];
                  if (daySchedule) {
                    const normalizedDate = new Date(Date.UTC(
                      targetDate.getFullYear(),
                      targetDate.getMonth(),
                      targetDate.getDate()
                    ));
                    console.log('Copying day schedule:', {
                      schedule: daySchedule,
                      employeeId,
                      date: normalizedDate
                    });
                    onCopySchedule(daySchedule, [employeeId], [normalizedDate]);
                  }
                  break;

                case "week":
                  Object.values(schedules).forEach((schedule, dayIndex) => {
                    const date = new Date(targetDate);
                    date.setDate(date.getDate() + dayIndex);
                    onCopySchedule(schedule, [employeeId], [date]);
                  });
                  break;

                case "month":
                  Object.values(schedules).forEach((schedule, dayIndex) => {
                    const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), dayIndex + 1);
                    onCopySchedule(schedule, [employeeId], [date]);
                  });
                  break;
              }
            });

            setIsDialogOpen(false);
          }}
        />
      )}
    </Card>
  );
}
