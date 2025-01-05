export interface Employee {
  id?: string;
  name: string;
  hours: number;
  defaultColor?: string;
  schedules?: {
    [date: string]: DaySchedule | undefined;
  };
}

export interface ScheduleHistory {
  timestamp: Date;
  employeeIndex: number;
  previousSchedule: DaySchedule | undefined;
  newSchedule: DaySchedule | undefined;
}

export interface DaySchedule {
  start: number;
  end: number;
  color: string;
  hours: number;
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
  type: 'schedule' | 'special';
} 