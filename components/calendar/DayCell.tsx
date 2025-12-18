import { memo } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DayCellStatus } from '@/types/medication';

interface DayCellProps {
  date: string;
  day: number;
  status: DayCellStatus;
  isToday: boolean;
  isCurrentMonth: boolean;
  isDrinkingDay?: boolean;
  hasMemo?: boolean;
  onPress: () => void;
}

const statusStyles: Record<DayCellStatus, { container: string; text: string }> = {
  taken: {
    container: '',
    text: 'text-gray-900 font-semibold',
  },
  missed: {
    container: '',
    text: 'text-gray-400',
  },
  scheduled: {
    container: 'bg-orange-100',
    text: 'text-orange-600 font-medium',
  },
  rest: {
    container: '',
    text: 'text-gray-400',
  },
  today: {
    container: 'border-2 border-orange-500',
    text: 'text-orange-600 font-semibold',
  },
  disabled: {
    container: '',
    text: 'text-gray-200',
  },
  // 술 경고 스타일 (밑줄로 표시, 배경색 없음)
  drinking_dday: {
    container: '',
    text: 'text-gray-900 font-bold',
  },
  drinking_warning1: {
    container: '',
    text: 'text-gray-900 font-semibold',
  },
  drinking_warning2: {
    container: '',
    text: 'text-gray-900 font-medium',
  },
  drinking_warning3: {
    container: '',
    text: 'text-gray-700 font-medium',
  },
  drinking_warning4: {
    container: '',
    text: 'text-gray-600',
  },
};

// 술 경고 밑줄 색상
const drinkingUnderlineColors: Record<string, string> = {
  drinking_dday: 'bg-red-600',
  drinking_warning1: 'bg-red-500',
  drinking_warning2: 'bg-red-400',
  drinking_warning3: 'bg-red-300',
  drinking_warning4: 'bg-red-200',
};

function DayCellComponent({
  day,
  status,
  isToday,
  isCurrentMonth,
  isDrinkingDay,
  hasMemo,
  onPress,
}: DayCellProps) {
  const effectiveStatus: DayCellStatus = !isCurrentMonth ? 'disabled' : status;
  const styles = statusStyles[effectiveStatus];

  // 모든 날짜 클릭 가능 (disabled만 제외) - 미래 날짜도 술 약속 추가 가능
  const isInteractive = isCurrentMonth && effectiveStatus !== 'disabled';

  // 오늘이면서 아직 복용하지 않은 경우 주황색 테두리 표시 (음주 경고와 별개로)
  const showTodayBorder = isToday && isCurrentMonth && effectiveStatus !== 'taken';
  const todayBorderStyle = showTodayBorder ? 'border-2 border-orange-500' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      className="w-[14.28%] items-center py-1"
      activeOpacity={isInteractive ? 0.6 : 1}
    >
      <View
        className={`relative h-10 w-10 items-center justify-center rounded-full ${styles.container} ${todayBorderStyle}`}
      >
        <Text className={`text-base ${styles.text}`}>{day}</Text>
        {/* 술 경고 밑줄 */}
        {drinkingUnderlineColors[effectiveStatus] && (
          <View className={`absolute bottom-1.5 h-0.5 w-5 rounded-full ${drinkingUnderlineColors[effectiveStatus]}`} />
        )}
        {/* 복용 완료 체크 */}
        {effectiveStatus === 'taken' && (
          <View className="absolute -right-0.5 -top-0.5">
            <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
          </View>
        )}
        {isDrinkingDay && (
          <View className="absolute -right-1 -top-1">
            <Ionicons name="wine" size={14} color="#DC2626" />
          </View>
        )}
        {hasMemo && (
          <View className="absolute -bottom-0.5 -left-0.5 h-2 w-2 rounded-full bg-blue-400" />
        )}
      </View>
    </TouchableOpacity>
  );
}

export const DayCell = memo(DayCellComponent);
