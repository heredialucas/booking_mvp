export interface Employee {
  name: string;
  hours: number;
  defaultColor?: string;
  schedule?: {
    start: number;
    end: number;
    color: string;
  };
}

export interface ScheduleHistory {
  timestamp: Date;
  employeeIndex: number;
  previousSchedule: Employee['schedule'];
  newSchedule: Employee['schedule'];
}

export interface Schedule {
  start: number;
  end: number;
  color: string;
  lunchStart?: number;
  lunchEnd?: number;
} 