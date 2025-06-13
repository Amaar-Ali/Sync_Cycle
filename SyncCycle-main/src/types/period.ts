export interface PeriodEntry {
  id?: string;
  userId?: string;
  date: string;
  flow: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: string;
  notes: string;
  isFirstDayOfCycle: boolean;
}

export interface CycleData {
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  averageCycleLength: number;
}

export interface DayInfo {
  date: string;
  phase: 'period' | 'follicular' | 'ovulation' | 'luteal' | 'pms' | null;
  isPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  dayOfCycle: number;
}

export interface LogEntry {
  id?: string;
  userId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
  component?: string;
}
