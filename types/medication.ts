export type FrequencyType = 'daily' | 'every2days' | 'every3days' | 'weekly' | 'custom';

export interface MedicationSchedule {
  frequency: FrequencyType;
  customDays?: number;
  referenceDate: string; // ISO date string
}

export interface MedicationRecord {
  date: string; // ISO date string
  taken: boolean;
  takenAt?: string; // ISO datetime string
}

export interface TodayStatus {
  isMedicationDay: boolean;
  hasTakenToday: boolean;
}