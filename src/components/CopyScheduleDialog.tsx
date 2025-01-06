import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Employee, DaySchedule } from "@/types/types";
import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";

interface CopyScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: DaySchedule[];
  employees: Employee[];
  viewType: "day" | "week" | "month";
  startDate: Date;
  onCopy: (employees: number[], targetDate: Date) => void;
}

const normalizeDate = (date: Date): Date => {
  // Crear fecha usando UTC para evitar problemas de zona horaria
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  ));
};

export function CopyScheduleDialog({
  isOpen,
  onClose,
  employees,
  viewType,
  startDate,
  onCopy,
}: CopyScheduleDialogProps) {
  const t = useTranslations();
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const [targetDate, setTargetDate] = useState<Date>(() => {
    const nextDay = normalizeDate(startDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    return nextDay;
  });

  const minDate = useMemo(() => {
    const nextDay = normalizeDate(startDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    return nextDay;
  }, [startDate]);

  useEffect(() => {
    const nextDay = normalizeDate(startDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    setTargetDate(nextDay);
  }, [startDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    const selectedDate = new Date(Date.UTC(year, month - 1, day));
    setTargetDate(selectedDate);
  };

  const handleCopy = () => {
    if (selectedEmployees.length === 0) {
      alert(t("history.select_employees"));
      return;
    }
    onCopy(selectedEmployees, targetDate);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg p-6 max-w-md w-full">
        <DialogTitle className="text-xl font-medium mb-4">
          {t("history.copy_schedule")}
        </DialogTitle>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="employee-select">
              {t("history.select_employees")}
            </label>
            <select
              id="employee-select"
              multiple
              value={selectedEmployees.map(String)}
              onChange={(e) =>
                setSelectedEmployees(
                  Array.from(e.target.selectedOptions, (option) =>
                    Number(option.value)
                  )
                )
              }
              className="border rounded px-2 py-1 w-full h-32"
            >
              {employees.map((employee, index) => (
                <option key={index} value={index}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="target-date">
              {t("history.target_date")}
            </label>
            <input
              id="target-date"
              type="date"
              min={minDate.toISOString().split("T")[0]}
              value={targetDate.toISOString().split("T")[0]}
              onChange={handleDateChange}
              className="border rounded px-2 py-1 w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              {viewType === "day" && t("history.copy_day_hint")}
              {viewType === "week" && t("history.copy_week_hint")}
              {viewType === "month" && t("history.copy_month_hint")}
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 border rounded"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {t("common.copy")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
