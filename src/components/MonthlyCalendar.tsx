"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Employee, CalendarEvent } from "@/types/types";
import CalendarContextMenu from "./CalendarContextMenu";

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface MonthlyCalendarProps {
  employees: Employee[];
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onNavigate: (date: Date) => void;
  onSelectSlot: (start: Date, end: Date) => void;
  onViewDay: (date: Date) => void;
  onViewWeek: (date: Date) => void;
}

export default function MonthlyCalendar({
  employees,
  events,
  onNavigate,
  onSelectSlot,
  onViewDay,
  onViewWeek,
}: MonthlyCalendarProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    date: Date;
  } | null>(null);

  const handleSelectSlot = (slotInfo: { start: Date; box?: { x: number; y: number; clientX: number; clientY: number } }) => {
    if (!slotInfo.box) return;
    const { start, box: { clientX: x, clientY: y } } = slotInfo;
    setContextMenu({ x, y, date: start });
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
  };

  const getEmployeesWorkingMessage = () => {
    const workingEmployees = employees.filter((emp) => emp.schedule);
    return `${workingEmployees.length} empleados programados`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600">{getEmployeesWorkingMessage()}</p>
      </div>
      <div className="h-[700px] bg-white p-4 rounded-lg shadow">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH}
          views={["month"]}
          onSelectSlot={handleSelectSlot}
          onNavigate={onNavigate}
          selectable
          popup
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || "#3174ad",
            },
          })}
          messages={{
            today: "Hoy",
            previous: "Anterior",
            next: "Siguiente",
            month: "Mes",
            noEventsInRange: "No hay eventos en este período",
          }}
        />
      </div>
      <CalendarContextMenu
        position={contextMenu}
        onClose={handleCloseMenu}
        onCreateEvent={() => {
          if (contextMenu) {
            onSelectSlot(contextMenu.date, contextMenu.date);
            handleCloseMenu();
          }
        }}
        onViewDay={() => {
          if (contextMenu) {
            onViewDay(contextMenu.date);
            handleCloseMenu();
          }
        }}
        onViewWeek={() => {
          if (contextMenu) {
            onViewWeek(contextMenu.date);
            handleCloseMenu();
          }
        }}
      />
    </div>
  );
}
