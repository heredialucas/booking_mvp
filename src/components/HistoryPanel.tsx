"use client";

import { Card } from "@/components/ui/card";
import { Employee, ScheduleHistory } from "@/types/types";

interface HistoryPanelProps {
  history: ScheduleHistory[];
  employees: Employee[];
  onCopySchedule: (schedule: Employee['schedule']) => void;
}

export default function HistoryPanel({
  history,
  employees,
  onCopySchedule,
}: HistoryPanelProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-medium mb-6">Historial de Cambios</h2>
      <div className="space-y-4">
        {history.map((entry, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <strong>Empleado:</strong> {employees[entry.employeeIndex].name}
              </div>
              <div>
                <strong>Fecha:</strong> {entry.timestamp.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Horario Anterior:</strong>
                {entry.previousSchedule
                  ? ` ${entry.previousSchedule.start/2 + 8}:${entry.previousSchedule.start % 2 ? "30" : "00"} - 
                     ${entry.previousSchedule.end/2 + 8}:${entry.previousSchedule.end % 2 ? "30" : "00"}`
                  : " Sin horario"}
              </div>
              <div>
                <strong>Nuevo Horario:</strong>
                {entry.newSchedule ? 
                  ` ${entry.newSchedule.start/2 + 8}:${entry.newSchedule.start % 2 ? "30" : "00"} - 
                     ${entry.newSchedule.end/2 + 8}:${entry.newSchedule.end % 2 ? "30" : "00"}`
                  : " Sin horario"
                }
              </div>
            </div>
            <button
              onClick={() => onCopySchedule(entry.newSchedule)}
              className="w-full p-2 bg-green-500 text-white rounded"
            >
              Copiar Horario
            </button>
          </Card>
        ))}
      </div>
    </Card>
  );
} 