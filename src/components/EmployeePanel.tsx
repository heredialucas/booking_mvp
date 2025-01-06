"use client";

import { Card } from "@/components/ui/card";
import { Employee } from "@/types/types";
import { getRandomColor } from "@/lib/utils";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();

  const calculateEmployeeStats = (employee: Employee) => {
    if (!employee.schedules || Object.keys(employee.schedules).length === 0)
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
      schedules: Object.fromEntries(
        Object.entries(employee.schedules).map(([date, schedule]) => [
          date,
          { ...schedule, color }
        ])
      )
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
    <Card className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-medium">{t('navigation.employees')}</h2>
        <button
          onClick={onAddEmployee}
          className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded text-sm w-full sm:w-auto"
        >
          + {t('employee.add')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {employees.map((employee, index) => {
          const stats = calculateEmployeeStats(employee);
          return (
            <Card key={index} className="p-4">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={employee.name}
                    onChange={(e) =>
                      onUpdateEmployee(index, {
                        ...employee,
                        name: e.target.value,
                      })
                    }
                    className="flex-1 p-2 border rounded text-base"
                  />
                  <button
                    onClick={() => onRemoveEmployee(index)}
                    className="p-2 bg-red-500 text-white rounded w-8 h-8 flex items-center justify-center text-base"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center gap-3 text-base">
                  <label className="flex items-center gap-2">
                    {t('employee.select_color')}:
                    <input
                      type="color"
                      className="w-8 h-8 p-0 cursor-pointer"
                      value={ensureValidHexColor(employee.defaultColor)}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm sm:text-base bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600">{t('employee.daily_hours')}</span>
                    <span className="font-medium text-lg">
                      {stats.dailyHours.toFixed(2)}h
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600">{t('employee.weekly_hours')}</span>
                    <span className="font-medium text-lg">
                      {stats.weeklyHours.toFixed(2)}h
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                    <span className="text-gray-600">{t('employee.monthly_hours')}</span>
                    <span className="font-medium text-lg">
                      {stats.monthlyHours.toFixed(2)}h
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
