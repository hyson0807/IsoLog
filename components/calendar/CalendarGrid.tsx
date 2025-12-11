import { View } from 'react-native';
import { DayCell } from './DayCell';
import { DayCellStatus } from '@/types/medication';
import {
  getCalendarDates,
  getToday,
  getDayFromDate,
  isDateInMonth,
  getScheduledDatesInMonth,
} from '@/utils/dateUtils';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { frequencyOptions } from '@/constants/frequency';

interface CalendarGridProps {
  year: number;
  month: number;
  startDay?: 0 | 1;
  onDayPress: (date: string) => void;
}

export function CalendarGrid({
  year,
  month,
  startDay = 0,
  onDayPress,
}: CalendarGridProps) {
  const { takenDates, schedule, canEditDate } = useMedicationContext();
  const today = getToday();

  // 주기 일수 계산
  const frequencyDays =
    frequencyOptions.find((opt) => opt.type === schedule.frequency)?.days || 1;

  // 미래 복용 예정일 계산
  const scheduledDates = getScheduledDatesInMonth(
    schedule.referenceDate,
    frequencyDays,
    year,
    month
  );

  // 42개 날짜 배열 생성
  const dates = getCalendarDates(year, month, startDay);

  // 날짜 상태 결정
  const getDayCellStatus = (date: string): DayCellStatus => {
    const isTaken = takenDates.has(date);
    const isScheduled = scheduledDates.has(date);
    const isEditable = canEditDate(date);

    if (date < today) {
      // 과거
      if (!isEditable) return 'disabled';
      return isTaken ? 'taken' : 'missed';
    } else if (date === today) {
      // 오늘
      return isTaken ? 'taken' : 'today';
    } else {
      // 미래
      return isScheduled ? 'scheduled' : 'rest';
    }
  };

  return (
    <View className="flex-row flex-wrap px-2">
      {dates.map((date) => {
        const day = getDayFromDate(date);
        const isCurrentMonth = isDateInMonth(date, year, month);
        const isToday = date === today;
        const status = getDayCellStatus(date);

        return (
          <DayCell
            key={date}
            date={date}
            day={day}
            status={status}
            isToday={isToday}
            isCurrentMonth={isCurrentMonth}
            onPress={() => onDayPress(date)}
          />
        );
      })}
    </View>
  );
}
