"use client";

import { Card } from "@/components/ui/card";
import { Employee, ScheduleHistory } from "@/types/types";

interface SidebarProps {
  employees: Employee[];
  scheduleHistory: ScheduleHistory[];
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onCopySchedule: (schedule: Employee['schedule']) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (index: number) => void;
}

export default function Sidebar({
  employees,
  scheduleHistory,
  onUpdateEmployee,
  onCopySchedule,
  onAddEmployee,
  onRemoveEmployee,
}: SidebarProps) {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-600",
    "bg-yellow-300",
    "bg-purple-800",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ];

  return (
    <Card className="w-64 p-4 h-screen overflow-y-auto">
      <h2 className="text-lg font-medium mb-4">Empleados</h2>
      <button
        onClick={onAddEmployee}
        className="w-full mb-4 p-2 bg-blue-500 text-white rounded"
      >
        Añadir Empleado
      </button>
      <div className="space-y-4">
        {employees.map((employee, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              value={employee.name}
              onChange={(e) =>
                onUpdateEmployee(index, { ...employee, name: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded ${color} ${
                    employee.schedule?.color === color
                      ? "ring-2 ring-offset-2 ring-black"
                      : ""
                  }`}
                  onClick={() =>
                    onUpdateEmployee(index, {
                      ...employee,
                      schedule: {
                        start: employee.schedule?.start || 0,
                        end: employee.schedule?.end || 0,
                        color,
                      },
                    })
                  }
                />
              ))}
            </div>
            <button
              onClick={() => onRemoveEmployee(index)}
              className="w-full p-2 bg-red-500 text-white rounded"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-medium mt-8 mb-4">Historial</h2>
      <div className="space-y-2">
        {scheduleHistory.map((entry, index) => (
          <div key={index} className="p-2 border rounded">
            <div>
              <strong>Empleado:</strong> {employees[entry.employeeIndex].name}
            </div>
            <div>
              <strong>Fecha:</strong> {entry.timestamp.toLocaleString()}
            </div>
            <button
              onClick={() => onCopySchedule(entry.newSchedule)}
              className="mt-2 w-full p-1 bg-green-500 text-white rounded"
            >
              Copiar Horario
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
} 