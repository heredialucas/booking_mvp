"use client";

import { useState, useEffect } from "react";
import {
  Employee,
  ScheduleHistory,
  CalendarEvent,
  DaySchedule as DayScheduleType,
} from "@/types/types";
import MonthlyCalendar from "./MonthlyCalendar";
import EmployeePanel from "./EmployeePanel";
import HistoryPanel from "./HistoryPanel";
import { getRandomColor } from "@/lib/utils";
import WeeklySchedule from "./WeeklySchedule";
import SpecialEventDialog from "./SpecialEventDialog";
import { default as DaySchedule } from "./DaySchedule";

type ActivePanel = "calendar" | "employees" | "history";
type CalendarView = "month" | "week" | "day";

interface StoredEvent extends Omit<CalendarEvent, "start" | "end"> {
  start: string;
  end: string;
}

interface StoredEmployee extends Omit<Employee, "schedules"> {
  schedules?: {
    [key: string]: DayScheduleType;
  };
}

const formatScheduleToEvent = (
  employee: Employee,
  date: string,
  schedule: DayScheduleType
): CalendarEvent => {
  const [year, month, day] = date.split('-').map(Number);
  const startDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
  const endDate = new Date(year, month - 1, day);

  startDate.setHours(Math.floor(schedule.start / 2) + 8);
  startDate.setMinutes((schedule.start % 2) * 30);

  endDate.setHours(Math.floor(schedule.end / 2) + 8);
  endDate.setMinutes((schedule.end % 2) * 30);

  return {
    id: `schedule-${employee.name}-${date}`,
    title: `${employee.name} (${schedule.hours}h)`,
    start: startDate,
    end: endDate,
    color: schedule.color,
    type: "schedule",
  };
};

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

  // Cargar eventos al iniciar
  useEffect(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map(
        (event: StoredEvent) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        })
      );
      setEvents(parsedEvents);
    }
  }, []);

  // Cargar horarios de empleados al iniciar
  useEffect(() => {
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) {
      const parsedEmployees = JSON.parse(savedEmployees).map(
        (employee: StoredEmployee) => ({
          ...employee,
          schedules: employee.schedules || undefined,
        })
      );
      setEmployees(parsedEmployees);
    }
  }, []);

  // Agregar este useEffect para guardar empleados cuando se actualicen
  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  // Modificar el useEffect que convierte los horarios a eventos
  useEffect(() => {
    const scheduleEvents = employees.flatMap((employee) => {
      if (!employee.schedules) return [];

      return Object.entries(employee.schedules)
        .map(([date, schedule]) => {
          if (!schedule) return null;
          return formatScheduleToEvent(employee, date, schedule);
        })
        .filter((event): event is CalendarEvent => event !== null);
    });

    // Mantener solo los eventos especiales del estado actual
    const currentSpecialEvents = events.filter((event) => event.type === "special");
    
    // Comparar si realmente necesitamos actualizar
    const newEvents = [...currentSpecialEvents, ...scheduleEvents];
    const currentEventsStr = JSON.stringify(events);
    const newEventsStr = JSON.stringify(newEvents);
    
    if (currentEventsStr !== newEventsStr) {
      setEvents(newEvents);
    }
  }, [employees]); // Solo depender de employees

  // Mantener el useEffect para guardar en localStorage
  useEffect(() => {
    const specialEvents = events.filter((event) => event.type === "special");
    localStorage.setItem(
      "calendarEvents",
      JSON.stringify(
        specialEvents.map((event) => ({
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
        }))
      )
    );
  }, [events]);

  const handleUpdateEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);

    // Actualizar localStorage
    localStorage.setItem("employees", JSON.stringify(newEmployees));
  };

  const handleUpdateEmployee = (index: number, employee: Employee) => {
    const newEmployees = [...employees];
    newEmployees[index] = employee;
    handleUpdateEmployees(newEmployees);
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

  const handleCopySchedule = (schedule: DayScheduleType | undefined) => {
    if (!schedule) return;
    const dateKey = selectedDate.toISOString().split("T")[0];

    const newEmployees = employees.map((emp) => ({
      ...emp,
      schedules: {
        ...(emp.schedules || {}),
        [dateKey]: {
          ...schedule,
          color: emp.schedules?.[dateKey]?.color || schedule.color,
        },
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
      id: `special-${Date.now()}`,
      type: "special",
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
            selectedDate={selectedDate}
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
              date={selectedDate}
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
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
            onUpdateEmployee={handleUpdateEmployee}
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
