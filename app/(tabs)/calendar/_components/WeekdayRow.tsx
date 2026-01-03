import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface WeekdayRowProps {
  startDay?: 0 | 1; // 0: 일요일, 1: 월요일
}

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// 요일별 색상 인덱스 (0: 일요일, 6: 토요일)
function getWeekdayColorIndex(index: number, startDay: 0 | 1): number {
  if (startDay === 1) {
    return (index + 1) % 7;
  }
  return index;
}

// 요일 키 순서 조정
function getWeekdayKeys(startDay: 0 | 1): typeof WEEKDAY_KEYS[number][] {
  if (startDay === 1) {
    return [...WEEKDAY_KEYS.slice(1), WEEKDAY_KEYS[0]];
  }
  return [...WEEKDAY_KEYS];
}

export function WeekdayRow({ startDay = 0 }: WeekdayRowProps) {
  const { t } = useTranslation();
  const weekdayKeys = getWeekdayKeys(startDay);

  return (
    <View className="flex-row px-2 pb-2">
      {weekdayKeys.map((key, index) => {
        const dayIndex = getWeekdayColorIndex(index, startDay);
        const isSunday = dayIndex === 0;
        const isSaturday = dayIndex === 6;

        let textColor = 'text-gray-500';
        if (isSunday) textColor = 'text-red-400';
        if (isSaturday) textColor = 'text-blue-400';

        return (
          <View key={key} className="w-[14.28%] items-center py-2">
            <Text className={`text-sm font-medium ${textColor}`}>
              {t(`calendar.weekdays.${key}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
