"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Employee, CalendarEvent, DaySchedule } from "@/types/types";
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
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onNavigate: (date: Date) => void;
  onSelectSlot: (start: Date, end: Date) => void;
  onViewDay: (date: Date) => void;
  onViewWeek: (date: Date) => void;
}

const formatScheduleToEvent = (
  employee: Employee,
  date: string,
  schedule: DaySchedule
): CalendarEvent => {
  const startDate = new Date(date + 'T00:00:00');
  const endDate = new Date(date + 'T00:00:00');

  startDate.setHours(Math.floor(schedule.start / 2) + 8);
  startDate.setMinutes((schedule.start % 2) * 30);

  endDate.setHours(Math.floor(schedule.end / 2) + 8);
  endDate.setMinutes((schedule.end % 2) * 30);

  // Formatear las horas para el título
  const startHour = `${Math.floor(schedule.start / 2) + 8}:${(schedule.start % 2) * 30 || '00'}`;
  const endHour = `${Math.floor(schedule.end / 2) + 8}:${(schedule.end % 2) * 30 || '00'}`;

  return {
    id: `${employee.name}-${date}`,
    title: `${employee.name} (${startHour}-${endHour})`,
    start: startDate,
    end: endDate,
    color: schedule.color,
    type: "schedule",
  };
};

export default function MonthlyCalendar({
  employees,
  events,
  selectedDate,
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
  const [isDragging, setIsDragging] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Modificar el useEffect existente para limpiar los estados cuando cambia la fecha
  useEffect(() => {
    const cleanup = () => {
      setIsDragging(false);
      setIsNavigating(false);
      setContextMenu(null);
    };

    cleanup();
    return cleanup;
  }, [selectedDate]);

  // Modificar el handleNavigate para manejar mejor la navegación
  const handleNavigate = (newDate: Date) => {
    if (!newDate || isNaN(newDate.getTime())) return;
    onNavigate(newDate);
  };

  // Modificar el handleSelectSlot para ser más robusto
  const handleSelectSlot = (slotInfo: {
    start: Date;
    action: 'select' | 'click' | 'doubleClick';
    box?: { x: number; y: number; clientX: number; clientY: number };
  }) => {
    if (isNavigating) return;
    
    if (slotInfo.action === 'select') {
      setIsDragging(true);
      setContextMenu(null);
    } else if (slotInfo.box) {
      setIsDragging(false);
      const { start, box: { clientX: x, clientY: y } } = slotInfo;
      setContextMenu({ x, y, date: start });
    }
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
  };

  const getEmployeesWorkingMessage = () => {
    const workingEmployees = employees.filter((emp) => {
      const dateKey = selectedDate.toISOString().split("T")[0];
      return emp.schedules?.[dateKey];
    });
    return `${workingEmployees.length} empleados programados`;
  };

  // Convertir los horarios de empleados a eventos del calendario
  const employeeScheduleEvents = employees.flatMap<CalendarEvent>((employee) => {
    if (!employee.schedules) return [];

    return Object.entries(employee.schedules)
      .filter(([, schedule]) => schedule !== undefined)
      .map(([date, schedule]) => formatScheduleToEvent(employee, date, schedule!));
  });

  // Filtrar eventos especiales que no sean de tipo "schedule"
  const specialEvents = events.filter(event => event.type !== "schedule");

  // Combinar eventos especiales con horarios de empleados
  const allEvents = [...specialEvents, ...employeeScheduleEvents];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600">{getEmployeesWorkingMessage()}</p>
      </div>
      <div className="h-[700px] bg-white p-4 rounded-lg shadow">
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH}
          views={["month"]}
          onSelectSlot={handleSelectSlot}
          onNavigate={handleNavigate}
          selectable={!isDragging}
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
          onSelecting={() => {
            if (isNavigating) return false;
            return true;
          }}
          onView={() => {
            setIsDragging(false);
            setIsNavigating(false);
            setContextMenu(null);
          }}
          date={selectedDate}
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
