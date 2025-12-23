/**
 * 시간을 12시간 형식의 문자열로 포맷합니다.
 * @param hour 0-23 사이의 시간
 * @param minute 0-59 사이의 분
 * @param isKorean 한국어 형식 사용 여부
 * @returns 포맷된 시간 문자열 (예: "오후 10:00" 또는 "10:00 PM")
 */
export function formatTime(hour: number, minute: number, isKorean: boolean): string {
  const period = hour < 12 ? (isKorean ? '오전' : 'AM') : (isKorean ? '오후' : 'PM');
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');

  if (isKorean) {
    return `${period} ${displayHour}:${displayMinute}`;
  }
  return `${displayHour}:${displayMinute} ${period}`;
}
