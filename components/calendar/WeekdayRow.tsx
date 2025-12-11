import { View, Text } from 'react-native';
import { getLocales } from 'expo-localization';

interface WeekdayRowProps {
  startDay?: 0 | 1; // 0: 일요일, 1: 월요일
}

// 요일 레이블 (locale 기반)
function getWeekdayLabels(startDay: 0 | 1): string[] {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';
  const isKorean = locale.startsWith('ko');

  const labels = isKorean
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (startDay === 1) {
    // 월요일 시작
    return [...labels.slice(1), labels[0]];
  }
  return labels;
}

// 요일별 색상 인덱스 (0: 일요일, 6: 토요일)
function getWeekdayColorIndex(index: number, startDay: 0 | 1): number {
  if (startDay === 1) {
    return (index + 1) % 7;
  }
  return index;
}

export function WeekdayRow({ startDay = 0 }: WeekdayRowProps) {
  const labels = getWeekdayLabels(startDay);

  return (
    <View className="flex-row px-2 pb-2">
      {labels.map((label, index) => {
        const dayIndex = getWeekdayColorIndex(index, startDay);
        const isSunday = dayIndex === 0;
        const isSaturday = dayIndex === 6;

        let textColor = 'text-gray-500';
        if (isSunday) textColor = 'text-red-400';
        if (isSaturday) textColor = 'text-blue-400';

        return (
          <View key={label} className="w-[14.28%] items-center py-2">
            <Text className={`text-sm font-medium ${textColor}`}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}
