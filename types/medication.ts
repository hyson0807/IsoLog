export type FrequencyType = 'none' | 'daily' | 'every2days' | 'every3days' | 'every4days' | 'weekly' | 'custom';

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
  | 'disabled' // 비활성 (이전/다음 달 또는 첫 복용일 이전)
  | 'drinking_dday' // 술 당일
  | 'drinking_warning1' // D±1
  | 'drinking_warning2' // D±2
  | 'drinking_warning3' // D±3
  | 'drinking_warning4'; // D±4

// 술 약속 경고 레벨
export type DrinkingWarningLevel =
  | 'dday' // 술 당일 (100%)
  | 'day1' // D±1 (80%)
  | 'day2' // D±2 (60%)
  | 'day3' // D±3 (40%)
  | 'day4'; // D±4 (20%)

// 피부 상태 - 트러블 레벨
export type TroubleLevel = 'calm' | 'few' | 'severe';

// 피부 상태 - 건조함 레벨
export type DrynessLevel = 'moist' | 'normal' | 'dry';

// 피부 상태 기록
export interface SkinRecord {
  date: string; // ISO date string (YYYY-MM-DD)
  trouble?: TroubleLevel;
  dryness?: DrynessLevel;
  memo?: string;
  recordedAt: string; // ISO datetime string
}

// AsyncStorage에 저장할 데이터 구조
export interface MedicationStorageData {
  schedule: MedicationSchedule;
  takenDates: string[]; // Set은 직렬화 안되므로 배열로 저장
  firstTakenDate: string | null;
  drinkingDates: string[]; // 술 약속 날짜들
  skinRecords?: SkinRecord[]; // 피부 상태 기록
}