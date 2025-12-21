import { getLocales } from 'expo-localization';

export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(date: Date): string {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';

  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isMedicationDay(referenceDate: string, frequencyDays: number, targetDate?: string): boolean {
  // frequencyDays가 0이면 복용일 없음 (none)
  if (frequencyDays === 0) return false;

  const today = targetDate || getToday();
  const daysDiff = getDaysDifference(referenceDate, today);
  return daysDiff % frequencyDays === 0;
}

// 월/년 포맷 (locale 대응)
export function formatMonthYear(date: Date): string {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
  });
}

// 특정 날짜 포맷 (바텀시트용)
export function formatDateShort(dateString: string): string {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

// 캘린더 그리드용 날짜 배열 생성 (42개: 6주 x 7일)
export function getCalendarDates(year: number, month: number, startDay: 0 | 1 = 0): string[] {
  const dates: string[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // 주 시작 요일에 맞춰 이전 달 패딩 계산
  let dayOfWeek = firstDayOfMonth.getDay();
  if (startDay === 1) {
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }

  // 이전 달 날짜 추가
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    dates.push(formatLocalDate(d));
  }

  // 현재 달 날짜 추가
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    dates.push(formatLocalDate(new Date(year, month, d)));
  }

  // 다음 달 날짜로 42개까지 채우기
  let nextDayCount = 1;
  while (dates.length < 42) {
    const d = new Date(year, month + 1, nextDayCount);
    dates.push(formatLocalDate(d));
    nextDayCount++;
  }

  return dates;
}

// 특정 월의 복용 예정일 계산
export function getScheduledDatesInMonth(
  referenceDate: string,
  frequencyDays: number,
  year: number,
  month: number
): Set<string> {
  const scheduled = new Set<string>();

  // frequencyDays가 0이면 복용일 없음 (none)
  if (frequencyDays === 0) return scheduled;

  const today = getToday();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= lastDayOfMonth; d++) {
    const dateStr = formatLocalDate(new Date(year, month, d));
    // 미래 날짜이면서 복용일인 경우
    if (dateStr > today && isMedicationDay(referenceDate, frequencyDays, dateStr)) {
      scheduled.add(dateStr);
    }
  }
  return scheduled;
}

// 날짜가 특정 월에 속하는지 확인
export function isDateInMonth(dateString: string, year: number, month: number): boolean {
  const date = new Date(dateString + 'T00:00:00');
  return date.getFullYear() === year && date.getMonth() === month;
}

// 날짜에서 일(day)만 추출
export function getDayFromDate(dateString: string): number {
  return new Date(dateString + 'T00:00:00').getDate();
}

// 날짜에 일수 더하기
export function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  return formatDateToString(date);
}

// Date 객체를 YYYY-MM-DD 문자열로 변환
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 오늘부터 향후 N일간의 복용일 목록 반환
export function getUpcomingMedicationDays(
  referenceDate: string,
  frequencyDays: number,
  daysAhead: number = 7
): string[] {
  if (frequencyDays === 0) return [];

  const today = getToday();
  const result: string[] = [];

  for (let i = 0; i <= daysAhead; i++) {
    const targetDate = addDays(today, i);
    if (isMedicationDay(referenceDate, frequencyDays, targetDate)) {
      result.push(targetDate);
    }
  }

  return result;
}