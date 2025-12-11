import { getLocales } from 'expo-localization';

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
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
  const today = targetDate || getToday();
  const daysDiff = getDaysDifference(referenceDate, today);
  return daysDiff % frequencyDays === 0;
}