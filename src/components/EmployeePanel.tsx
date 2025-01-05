"use client";

import { Card } from "@/components/ui/card";
import { Employee } from "@/types/types";
import { getRandomColor } from "@/lib/utils";

interface EmployeePanelProps {
  employees: Employee[];
  onUpdateEmployee: (index: number, employee: Employee) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (index: number) => void;
  defaultColor?: string;
}

export default function EmployeePanel({
  employees,
  onUpdateEmployee,
  onAddEmployee,
  onRemoveEmployee,
}: EmployeePanelProps) {
  const calculateEmployeeStats = (employee: Employee) => {
    console.log(employee);
    if (!employee.schedule)
      return { dailyHours: 0, weeklyHours: 0, monthlyHours: 0 };

    const dailyHours = employee.hours;
    const weeklyHours = dailyHours * 5; // Asumiendo 5 días laborales
    const monthlyHours = weeklyHours * 4; // Asumiendo 4 semanas

    return {
      dailyHours,
      weeklyHours,
      monthlyHours,
    };
  };

  const handleColorChange = (index: number, color: string) => {
    const employee = employees[index];
    onUpdateEmployee(index, {
      ...employee,
      defaultColor: color,
      schedule: employee.schedule
        ? {
            ...employee.schedule,
            color,
          }
        : undefined,
    });
  };

  // Función auxiliar para asegurarnos que el color es válido
  const ensureValidHexColor = (color: string | undefined): string => {
    if (!color || !color.startsWith('#')) {
      return getRandomColor();
    }
    return color;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Empleados</h2>
        <button
          onClick={onAddEmployee}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          + Añadir
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee, index) => {
          const stats = calculateEmployeeStats(employee);
          return (
            <Card key={index} className="p-4 space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={employee.name}
                  onChange={(e) =>
                    onUpdateEmployee(index, {
                      ...employee,
                      name: e.target.value,
                    })
                  }
                  className="flex-1 p-1 border rounded text-sm"
                />
                <button
                  onClick={() => onRemoveEmployee(index)}
                  className="p-1 bg-red-500 text-white rounded w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  Color:
                  <input
                    type="color"
                    className="w-6 h-6 p-0 cursor-pointer"
                    value={ensureValidHexColor(employee.defaultColor)}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    title="Seleccionar color"
                  />
                </label>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Horas Diarias:</span>
                  <span className="font-medium">
                    {stats.dailyHours.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Horas Semanales:</span>
                  <span className="font-medium">
                    {stats.weeklyHours.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Horas Mensuales:</span>
                  <span className="font-medium">
                    {stats.monthlyHours.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
