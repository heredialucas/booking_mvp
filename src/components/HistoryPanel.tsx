"use client";

import { Card } from "@/components/ui/card";
import { Employee, ScheduleHistory, DaySchedule } from "@/types/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

interface HistoryPanelProps {
  history: ScheduleHistory[];
  employees: Employee[];
  onCopySchedule: (schedule: DaySchedule) => void;
}

export default function HistoryPanel({
  history,
  employees,
  onCopySchedule,
}: HistoryPanelProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnHelper = createColumnHelper<ScheduleHistory>();

  const formatSchedule = (schedule?: DaySchedule) => {
    if (!schedule) return "Sin horario";
    return `${schedule.start / 2 + 8}:${schedule.start % 2 ? "30" : "00"} - 
            ${schedule.end / 2 + 8}:${schedule.end % 2 ? "30" : "00"}`;
  };

  const columns = [
    columnHelper.accessor("timestamp", {
      header: "Fecha y Hora",
      cell: (info) => info.getValue().toLocaleString(),
    }),
    columnHelper.accessor("employeeIndex", {
      header: "Empleado",
      cell: (info) => employees[info.getValue()].name,
    }),
    columnHelper.accessor("previousSchedule", {
      header: "Horario Anterior",
      cell: (info) => formatSchedule(info.getValue()),
    }),
    columnHelper.accessor("newSchedule", {
      header: "Nuevo Horario",
      cell: (info) => formatSchedule(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => info.row.original.newSchedule && (
        <button
          onClick={() => onCopySchedule(info.row.original.newSchedule!)}
          className="px-2 py-1 bg-green-500 text-white rounded text-sm"
        >
          Copiar
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: history,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-medium mb-6">Historial de Cambios</h2>
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
    </Card>
  );
}
