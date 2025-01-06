"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar.css";
import { Employee, CalendarEvent, DaySchedule } from "@/types/types";
import CalendarContextMenu from "./CalendarContextMenu";
import { useTranslations } from 'next-intl';

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
  onSelectSlot: (start: Date) => void;
  onViewDay: (date: Date) => void;
  onViewWeek: (date: Date) => void;
  isReadOnly?: boolean;
  messages?: {
    today: string;
    previous: string;
    next: string;
    noEventsInRange: string;
  };
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

// Agregar estos estilos personalizados después de importar el CSS de react-big-calendar
const customDayPropGetter = () => {
  return {
    className: 'cursor-pointer hover:bg-gray-50 transition-colors duration-200',
    style: {
      margin: 0,
      padding: '0.5rem',
    },
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
  isReadOnly = false,
}: MonthlyCalendarProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    date: Date;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const t = useTranslations();

  // Modificar el useEffect existente para limpiar los estados cuando cambia la fecha
  useEffect(() => {
    const cleanup = () => {
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
    if (slotInfo.box) {
      const { start, box: { clientX: x, clientY: y } } = slotInfo;
      // Si es readonly (employee), solo mostrar menú de navegación
      if (isReadOnly) {
        setContextMenu({ x, y, date: start });
      } else if (!isNavigating) {
        setContextMenu({ x, y, date: start });
      }
    }
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
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

  const messages = {
    today: t('calendar.messages.today'),
    previous: t('calendar.messages.previous'),
    next: t('calendar.messages.next'),
    month: t('calendar.views.month'),
    week: t('calendar.views.week'),
    day: t('calendar.views.day'),
    noEventsInRange: t('calendar.messages.noEventsInRange'),
    showMore: (total: number) => `+${total} más`
  };

  // Agregar nuevo manejador para eventos
  const handleSelectEvent = (event: CalendarEvent, e: React.SyntheticEvent) => {
    // Obtener las coordenadas del clic
    const mouseEvent = e.nativeEvent as MouseEvent;
    setContextMenu({
      x: mouseEvent.clientX,
      y: mouseEvent.clientY,
      date: event.start
    });
  };

  return (
    <div className="space-y-4">
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
          selectable={true}
          popup
          dayPropGetter={customDayPropGetter}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || "#3174ad",
              cursor: 'pointer',
            },
          })}
          culture={t('locale')}
          messages={messages}
          date={selectedDate}
          onSelectEvent={handleSelectEvent}
        />
      </div>
      <CalendarContextMenu
        position={contextMenu}
        onClose={handleCloseMenu}
        onCreateEvent={!isReadOnly ? () => {
          if (contextMenu) {
            onSelectSlot(contextMenu.date);
            handleCloseMenu();
          }
        } : undefined}
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
