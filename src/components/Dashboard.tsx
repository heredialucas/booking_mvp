"use client";

import { useState, useEffect } from "react";
import { Employee, ScheduleHistory, CalendarEvent } from "@/types/types";
import DaySchedule from "./DaySchedule";
import MonthlyCalendar from "./MonthlyCalendar";
import EmployeePanel from "./EmployeePanel";
import HistoryPanel from "./HistoryPanel";
import { getRandomColor } from "@/lib/utils";
import WeeklySchedule from "./WeeklySchedule";
import SpecialEventDialog from "./SpecialEventDialog";

type ActivePanel = "calendar" | "employees" | "history";
type CalendarView = "month" | "week" | "day";

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("calendar");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [employees, setEmployees] = useState<Employee[]>([
    { name: "Worker 1", hours: 0, defaultColor: getRandomColor() },
    { name: "Worker 2", hours: 0, defaultColor: getRandomColor() },
  ]);
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  // Convertir los horarios de los empleados a eventos
  useEffect(() => {
    const newEvents = employees.flatMap((employee) => {
      if (!employee.schedule) return [];

      const start = new Date(selectedDate);
      const end = new Date(selectedDate);

      // Convertir los índices de media hora a horas reales
      start.setHours(8 + Math.floor(employee.schedule.start / 2));
      start.setMinutes((employee.schedule.start % 2) * 30);

      end.setHours(8 + Math.floor(employee.schedule.end / 2));
      end.setMinutes((employee.schedule.end % 2) * 30);

      return [
        {
          id: `schedule-${employee.name}`,
          title: employee.name,
          start,
          end,
          color: employee.schedule.color,
          employeeId: employee.name,
          type: "schedule" as const,
        },
      ];
    });

    setEvents(newEvents);
  }, [employees, selectedDate]);

  const handleUpdateEmployee = (index: number, updatedEmployee: Employee) => {
    const newEmployees = [...employees];
    newEmployees[index] = updatedEmployee;
    setEmployees(newEmployees);
  };

  const handleAddEmployee = () => {
    setEmployees((prev) => [
      ...prev,
      {
        name: `Empleado ${prev.length + 1}`,
        hours: 0,
        defaultColor: getRandomColor(),
      },
    ]);
  };

  const handleRemoveEmployee = (index: number) => {
    const newEmployees = employees.filter((_, i) => i !== index);
    setEmployees(newEmployees);
  };

  const handleCopySchedule = (schedule: Employee["schedule"]) => {
    if (!schedule) return;

    const newEmployees = employees.map((emp) => ({
      ...emp,
      schedule: {
        start: schedule.start,
        end: schedule.end,
        color: emp.schedule?.color || schedule.color,
      },
    }));
    setEmployees(newEmployees);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCalendarView("day");
  };

  const handleViewChange = (view: CalendarView) => {
    setCalendarView(view);
  };

  const handleAddSpecialEvent = (eventData: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleSelectSlot = (start: Date) => {
    setSelectedDate(start);
    setIsEventDialogOpen(true);
  };

  const handleViewDay = (date: Date) => {
    setSelectedDate(date);
    setCalendarView("day");
  };

  const handleViewWeek = (date: Date) => {
    setSelectedDate(date);
    setCalendarView("week");
  };

  const renderCalendarView = () => {
    switch (calendarView) {
      case "month":
        return (
          <MonthlyCalendar
            employees={employees}
            events={events}
            onSelectDate={handleDateSelect}
            onNavigate={setSelectedDate}
            onSelectSlot={handleSelectSlot}
            onViewDay={handleViewDay}
            onViewWeek={handleViewWeek}
          />
        );
      case "week":
        return (
          <WeeklySchedule
            selectedDate={selectedDate}
            employees={employees}
            onUpdateEmployees={setEmployees}
            onUpdateHistory={setScheduleHistory}
            onNavigateToMonth={() => setCalendarView("month")}
          />
        );
      case "day":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setIsEventDialogOpen(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Crear Evento Especial
              </button>
              <button
                onClick={() => setCalendarView("month")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Volver al Calendario
              </button>
            </div>
            <DaySchedule
              date={selectedDate.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
              employees={employees}
              onUpdateEmployees={setEmployees}
              onUpdateHistory={setScheduleHistory}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              activePanel === "calendar" ? "bg-blue-500 text-white" : "bg-white"
            }`}
            onClick={() => setActivePanel("calendar")}
          >
            Calendario
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activePanel === "employees"
                ? "bg-blue-500 text-white"
                : "bg-white"
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

        {activePanel === "calendar" && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded ${
                  calendarView === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
                onClick={() => handleViewChange("month")}
              >
                Mes
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  calendarView === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
                onClick={() => handleViewChange("week")}
              >
                Semana
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  calendarView === "day" ? "bg-blue-600 text-white" : "bg-white"
                }`}
                onClick={() => handleViewChange("day")}
              >
                Día
              </button>
            </div>
            {renderCalendarView()}
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
      <SpecialEventDialog
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onConfirm={handleAddSpecialEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}
