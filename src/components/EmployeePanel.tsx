"use client";

import { Card } from "@/components/ui/card";
import { Employee } from "@/types/types";
import { getRandomColor } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import DeleteEmployeeDialog from "./DeleteEmployeeDialog";

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
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    index: number;
    name: string;
  } | null>(null);

  const calculateEmployeeStats = (employee: Employee) => {
    if (!employee.schedules || Object.keys(employee.schedules).length === 0)
      return { dailyHours: 0, weeklyHours: 0, monthlyHours: 0 };

    // Calcular las horas trabajadas por día
    const hoursPerDay = Object.entries(employee.schedules).map(
      ([, schedule]) => {
        if (!schedule) return 0;
        // Convertir los slots de 30 minutos a horas
        const startHour = schedule.start / 2;
        const endHour = schedule.end / 2;
        return endHour - startHour;
      }
    );

    // Calcular promedio de horas diarias de los días que tiene programados
    const dailyHours =
      hoursPerDay.length > 0
        ? hoursPerDay.reduce((sum, hours) => sum + hours, 0) /
          hoursPerDay.length
        : 0;

    // Calcular horas semanales sumando las horas de los últimos 7 días
    const today = new Date();
    const lastWeekHours = Object.entries(employee.schedules)
      .filter(([date]) => {
        const scheduleDate = new Date(date);
        const diffTime = Math.abs(today.getTime() - scheduleDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      })
      .reduce((sum, [, schedule]) => {
        if (!schedule) return sum;
        return sum + (schedule.end - schedule.start) / 2;
      }, 0);

    // Calcular horas mensuales sumando las horas de los últimos 30 días
    const lastMonthHours = Object.entries(employee.schedules)
      .filter(([date]) => {
        const scheduleDate = new Date(date);
        const diffTime = Math.abs(today.getTime() - scheduleDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      })
      .reduce((sum, [, schedule]) => {
        if (!schedule) return sum;
        return sum + (schedule.end - schedule.start) / 2;
      }, 0);

    return {
      dailyHours,
      weeklyHours: lastWeekHours,
      monthlyHours: lastMonthHours,
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
          { ...schedule, color },
        ])
      ),
    });
  };

  // Función auxiliar para asegurarnos que el color es válido
  const ensureValidHexColor = (color: string | undefined): string => {
    if (!color || !color.startsWith("#")) {
      return getRandomColor();
    }
    return color;
  };

  const handleDeleteEmployee = (index: number, name: string) => {
    setEmployeeToDelete({ index, name });
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      onRemoveEmployee(employeeToDelete.index);
      setEmployeeToDelete(null);
    }
  };

  return (
    <Card className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-medium">
          {t("navigation.employees")}
        </h2>
        <button
          onClick={onAddEmployee}
          className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded text-sm w-full sm:w-auto"
        >
          + {t("employee.add")}
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
                    onClick={() => handleDeleteEmployee(index, employee.name)}
                    className="p-2 bg-red-500 text-white rounded w-8 h-8 flex items-center justify-center text-base"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center gap-3 text-base">
                  <label className="flex items-center gap-2">
                    {t("employee.select_color")}:
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
                    <span className="text-gray-600">
                      {t("employee.daily_hours")}
                    </span>
                    <span className="font-medium text-lg">
                      {stats.dailyHours.toFixed(2)}h
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600">
                      {t("employee.weekly_hours_last_7_days")}
                    </span>
                    <span className="font-medium text-lg">
                      {stats.weeklyHours.toFixed(2)}h
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                    <span className="text-gray-600">
                      {t("employee.monthly_hours_last_30_days")}
                    </span>
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
      <DeleteEmployeeDialog
        isOpen={employeeToDelete !== null}
        employeeName={employeeToDelete?.name || ""}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
}
