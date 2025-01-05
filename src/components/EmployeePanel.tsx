"use client";

import { Card } from "@/components/ui/card";
import { Employee } from "@/types/types";

interface EmployeePanelProps {
  employees: Employee[];
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (index: number) => void;
}

export default function EmployeePanel({
  employees,
  onUpdateEmployee,
  onAddEmployee,
  onRemoveEmployee,
}: EmployeePanelProps) {
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
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Empleados</h2>
        <button
          onClick={onAddEmployee}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Añadir Empleado
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee, index) => (
          <Card key={index} className="p-4 space-y-4">
            <input
              type="text"
              value={employee.name}
              onChange={(e) =>
                onUpdateEmployee(index, { ...employee, name: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded ${color} ${
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
          </Card>
        ))}
      </div>
    </Card>
  );
}
