export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const weekday = weekdays[date.getDay()];

  return `${month}월 ${day}일 ${weekday}`;
}

export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isMedicationDay(referenceDate: string, frequencyDays: number, targetDate?: string): boolean {
  const today = targetDate || getToday();
  const daysDiff = getDaysDifference(referenceDate, today);
  return daysDiff % frequencyDays === 0;
}