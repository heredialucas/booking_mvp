"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Employee, ScheduleHistory } from "@/types/types";
import DaySchedule from "./DaySchedule";
import EmployeePanel from "./EmployeePanel";
import HistoryPanel from "./HistoryPanel";

type ActivePanel = "schedule" | "employees" | "history";

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("schedule");
  const [employees, setEmployees] = useState<Employee[]>([
    { name: "Worker 1", hours: 0, schedule: { start: 0, end: 0, color: "bg-red-500" } },
    { name: "Worker 2", hours: 0, schedule: { start: 0, end: 0, color: "bg-blue-500" } },
  ]);
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleUpdateEmployee = (index: number, updatedEmployee: Employee) => {
    const newEmployees = [...employees];
    newEmployees[index] = updatedEmployee;
    setEmployees(newEmployees);
  };

  const handleAddEmployee = () => {
    setEmployees([...employees, { name: `Worker ${employees.length + 1}`, hours: 0 }]);
  };

  const handleRemoveEmployee = (index: number) => {
    const newEmployees = employees.filter((_, i) => i !== index);
    setEmployees(newEmployees);
  };

  const handleCopySchedule = (schedule: Employee['schedule']) => {
    if (!schedule) return;
    
    const newEmployees = employees.map(emp => ({
      ...emp,
      schedule: {
        start: schedule.start,
        end: schedule.end,
        color: emp.schedule?.color || schedule.color
      }
    }));
    setEmployees(newEmployees);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              activePanel === "schedule" ? "bg-blue-500 text-white" : "bg-white"
            }`}
            onClick={() => setActivePanel("schedule")}
          >
            Schedule
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activePanel === "employees" ? "bg-blue-500 text-white" : "bg-white"
            }`}
            onClick={() => setActivePanel("employees")}
          >
            Empleados
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activePanel === "history" ? "bg-blue-500 text-white" : "bg-white"
            }`}
            onClick={() => setActivePanel("history")}
          >
            Historial
          </button>
        </div>

        {activePanel === "schedule" && (
          <div className="space-y-4">
            <Card className="p-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                className="p-2 border rounded"
              />
            </Card>
            <DaySchedule
              date={selectedDate.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
              employees={employees}
              onUpdateEmployees={setEmployees}
              onUpdateHistory={setScheduleHistory}
            />
          </div>
        )}

        {activePanel === "employees" && (
          <EmployeePanel
            employees={employees}
            onUpdateEmployee={handleUpdateEmployee}
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
          />
        )}

        {activePanel === "history" && (
          <HistoryPanel
            history={scheduleHistory}
            employees={employees}
            onCopySchedule={handleCopySchedule}
          />
        )}
      </div>
    </div>
  );
} 