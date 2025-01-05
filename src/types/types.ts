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
    color: string;
  };
} 