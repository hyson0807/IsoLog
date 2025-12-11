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
    container: 'bg-green-500',
    text: 'text-white font-semibold',
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
  // 술 경고 스타일
  drinking_dday: {
    container: 'bg-red-600',
    text: 'text-white font-bold',
  },
  drinking_warning1: {
    container: 'bg-red-500',
    text: 'text-white font-semibold',
  },
  drinking_warning2: {
    container: 'bg-red-400',
    text: 'text-white font-medium',
  },
  drinking_warning3: {
    container: 'bg-red-300',
    text: 'text-red-800 font-medium',
  },
  drinking_warning4: {
    container: 'bg-red-100',
    text: 'text-red-600',
  },
};

function DayCellComponent({
  day,
  status,
  isCurrentMonth,
  isDrinkingDay,
  hasMemo,
  onPress,
}: DayCellProps) {
  const effectiveStatus: DayCellStatus = !isCurrentMonth ? 'disabled' : status;
  const styles = statusStyles[effectiveStatus];

  // 모든 날짜 클릭 가능 (disabled만 제외) - 미래 날짜도 술 약속 추가 가능
  const isInteractive = isCurrentMonth && effectiveStatus !== 'disabled';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      className="w-[14.28%] items-center py-1"
      activeOpacity={isInteractive ? 0.6 : 1}
    >
      <View
        className={`relative h-10 w-10 items-center justify-center rounded-full ${styles.container}`}
      >
        <Text className={`text-base ${styles.text}`}>{day}</Text>
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
