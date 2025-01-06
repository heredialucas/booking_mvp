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
  schedules: DaySchedule[];
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewType, setViewType] = useState<ViewType>("day");
  const [selectedSchedules, setSelectedSchedules] =
    useState<GroupedSchedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setStoredEmployees(employees);
  }, [employees, setStoredEmployees]);

  const groupedData = useMemo(() => {
    const grouped: { [key: string]: GroupedSchedule } = {};

    history.forEach((entry) => {
      if (!entry.newSchedule) return;

      const date = new Date(entry.timestamp);
      let key: string;
      let startDate = new Date(date);
      let endDate = new Date(date);

      switch (viewType) {
        case "day":
          key = `${entry.employeeIndex}-${date.toISOString().split("T")[0]}`;
          break;
        case "week":
          startDate = new Date(date);
          startDate.setDate(date.getDate() - date.getDay());
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          key = `${entry.employeeIndex}-${startDate.toISOString().split("T")[0]}`;
          break;
        case "month":
          startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          key = `${entry.employeeIndex}-${date.getFullYear()}-${date.getMonth()}`;
          break;
      }

      if (!grouped[key]) {
        grouped[key] = {
          startDate,
          endDate,
          employeeIndex: entry.employeeIndex,
          schedules: [],
        };
      }

      grouped[key].schedules.push(entry.newSchedule);
    });

    return Object.values(grouped);
  }, [history, viewType]);

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
      cell: (info) => `${info.getValue().length} ${t("history.shifts")}`,
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <button
          onClick={() => {
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
            
            selectedEmployees.forEach(employeeId => {
              switch (viewType) {
                case "day":
                  if (schedules[0]) {
                    onCopySchedule(schedules[0], [employeeId], [targetDate]);
                  }
                  break;

                case "week":
                  schedules.forEach((schedule, dayIndex) => {
                    const date = new Date(targetDate);
                    date.setDate(date.getDate() + dayIndex);
                    onCopySchedule(schedule, [employeeId], [date]);
                  });
                  break;

                case "month":
                  schedules.forEach((schedule, dayIndex) => {
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
