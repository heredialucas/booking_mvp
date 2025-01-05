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
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

type ActivePanel = "calendar" | "employees" | "history";
type CalendarView = "month" | "week" | "day";

const formatScheduleToEvent = (
  employee: Employee,
  date: string,
  schedule: DayScheduleType
): CalendarEvent => {
  const [year, month, day] = date.split("-").map(Number);
  const startDate = new Date(year, month - 1, day);
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [scheduleHistory, setScheduleHistory] = useState<ScheduleHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const t = useTranslations();

  // Cargar empleados al iniciar y cuando cambie el usuario
  useEffect(() => {
    const savedEmployees = localStorage.getItem("employees");
    console.log("Loading employees, user:", user?.name);
    console.log("Saved employees:", savedEmployees);
    if (savedEmployees) {
      try {
        const parsedEmployees = JSON.parse(savedEmployees);
        setEmployees(parsedEmployees);
      } catch (error) {
        console.error("Error parsing employees:", error);
      }
    }
  }, [user]);

  // Guardar empleados solo cuando se actualicen manualmente
  useEffect(() => {
    if (employees.length > 0) {
      // Solo guardar si hay empleados
      console.log("Saving employees:", employees);
      localStorage.setItem("employees", JSON.stringify(employees));
    }
  }, [employees]);

  // Convertir horarios a eventos
  useEffect(() => {
    if (employees.length === 0) return; // No procesar si no hay empleados

    console.log("Converting schedules to events, employees:", employees);
    const scheduleEvents = employees.flatMap((employee) => {
      if (!employee.schedules) return [];

      return Object.entries(employee.schedules)
        .map(([date, schedule]) => {
          if (!schedule) return null;
          return formatScheduleToEvent(employee, date, schedule);
        })
        .filter((event): event is CalendarEvent => event !== null);
    });

    const specialEvents = events.filter((event) => event.type === "special");
    setEvents([...specialEvents, ...scheduleEvents]);
  }, [employees]);

  const handleUpdateEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    // Forzar una actualización del selectedDate para refrescar la vista
    setSelectedDate((prev) => new Date(prev.getTime()));
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
        schedules: {},
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
    if (user?.role !== "admin") return; // Prevenir creación de eventos para empleados
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

  const handleCalendarNavigate = (date: Date) => {
    setSelectedDate(date);

    const scheduleEvents = employees.flatMap((employee) => {
      if (!employee.schedules) return [];
      return Object.entries(employee.schedules)
        .map(([d, schedule]) => {
          if (!schedule) return null;
          return formatScheduleToEvent(employee, d, schedule);
        })
        .filter((event): event is CalendarEvent => event !== null);
    });

    const specialEvents = events.filter((event) => event.type === "special");
    setEvents([...specialEvents, ...scheduleEvents]);
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
            onNavigate={handleCalendarNavigate}
            onSelectSlot={handleSelectSlot}
            onViewDay={handleViewDay}
            onViewWeek={handleViewWeek}
            isReadOnly={user?.role !== "admin"}
            messages={{
              today: t("calendar.messages.today"),
              previous: t("calendar.messages.previous"),
              next: t("calendar.messages.next"),
              noEventsInRange: t("calendar.messages.noEventsInRange"),
            }}
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
            isReadOnly={user?.role !== "admin"}
            backToCalendarText={t("calendar.actions.back_to_calendar")}
          />
        );
      case "day":
        return (
          <div className="space-y-4">
            <div className="flex justify-end items-center">
              {user?.role === "admin" && (
                <button
                  onClick={() => setIsEventDialogOpen(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                >
                  {t("calendar.actions.create_event")}
                </button>
              )}
              <button
                onClick={() => setCalendarView("month")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {t("calendar.actions.back_to_calendar")}
              </button>
            </div>
            <DaySchedule
              date={selectedDate}
              employees={employees}
              onUpdateEmployees={setEmployees}
              onUpdateHistory={setScheduleHistory}
              isReadOnly={user?.role !== "admin"}
            />
          </div>
        );
    }
  };

  useEffect(() => {
    if (
      user?.role === "employee" &&
      (activePanel === "employees" || activePanel === "history")
    ) {
      setActivePanel("calendar");
    }
  }, [activePanel, user?.role]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded ${
                activePanel === "calendar"
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
              onClick={() => setActivePanel("calendar")}
            >
              {t("navigation.calendar")}
            </button>
            {user?.role === "admin" && (
              <>
                <button
                  className={`px-4 py-2 rounded ${
                    activePanel === "employees"
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                  onClick={() => setActivePanel("employees")}
                >
                  {t("navigation.employees")}
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    activePanel === "history"
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                  onClick={() => setActivePanel("history")}
                >
                  {t("navigation.history")}
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {t("auth.logout")}
            </button>
          </div>
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
                {t("calendar.views.month")}
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  calendarView === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
                onClick={() => handleViewChange("week")}
              >
                {t("calendar.views.week")}
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  calendarView === "day" ? "bg-blue-600 text-white" : "bg-white"
                }`}
                onClick={() => handleViewChange("day")}
              >
                {t("calendar.views.day")}
              </button>
            </div>
            {renderCalendarView()}
          </div>
        )}

        {activePanel === "employees" && user?.role === "admin" && (
          <EmployeePanel
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
            onUpdateEmployee={handleUpdateEmployee}
          />
        )}

        {activePanel === "history" && user?.role === "admin" && (
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
