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

// 캘린더 날짜 셀 상태
export type DayCellStatus =
  | 'taken' // 복용 완료 (과거/오늘)
  | 'missed' // 미복용 (과거)
  | 'scheduled' // 복용 예정 (미래)
  | 'rest' // 휴약 (미래)
  | 'today' // 오늘 (미복용)
  | 'disabled'; // 비활성 (이전/다음 달 또는 첫 복용일 이전)

// AsyncStorage에 저장할 데이터 구조
export interface MedicationStorageData {
  schedule: MedicationSchedule;
  takenDates: string[]; // Set은 직렬화 안되므로 배열로 저장
  firstTakenDate: string | null;
}