import { memo } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { DayCellStatus } from '@/types/medication';

interface DayCellProps {
  date: string;
  day: number;
  status: DayCellStatus;
  isToday: boolean;
  isCurrentMonth: boolean;
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
};

function DayCellComponent({
  day,
  status,
  isCurrentMonth,
  onPress,
}: DayCellProps) {
  const effectiveStatus: DayCellStatus = !isCurrentMonth ? 'disabled' : status;
  const styles = statusStyles[effectiveStatus];

  // 과거/오늘만 터치 가능 (scheduled, rest, disabled는 터치 불가)
  const isInteractive =
    isCurrentMonth && !['scheduled', 'rest', 'disabled'].includes(effectiveStatus);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      className="w-[14.28%] items-center py-1"
      activeOpacity={isInteractive ? 0.6 : 1}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${styles.container}`}
      >
        <Text className={`text-base ${styles.text}`}>{day}</Text>
      </View>
    </TouchableOpacity>
  );
}

export const DayCell = memo(DayCellComponent);
