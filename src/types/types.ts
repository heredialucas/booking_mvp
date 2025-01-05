export interface Employee {
  name: string;
  hours: number;
  defaultColor?: string;
  schedule?: Schedule;
}

export interface ScheduleHistory {
  timestamp: Date;
  employeeIndex: number;
  previousSchedule: Schedule | undefined;
  newSchedule: Schedule | undefined;
}

export interface Schedule {
  start: number;
  end: number;
  color: string;
  lunchBreak?: {
    start: number;
    end: number;
  };
  randomBreaks?: Array<{
    start: number;
    end: number;
    reason: string;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  employeeId?: string;
  type: 'schedule' | 'event';
  allDay?: boolean;
} 