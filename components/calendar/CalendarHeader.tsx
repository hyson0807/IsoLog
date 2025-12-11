import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatMonthYear } from '@/utils/dateUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodayPress: () => void;
  showTodayButton: boolean;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onTodayPress,
  showTodayButton,
}: CalendarHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onPrevMonth}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <Text className="mx-4 text-xl font-bold text-gray-900">
          {formatMonthYear(currentDate)}
        </Text>

        <TouchableOpacity
          onPress={onNextMonth}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {showTodayButton && (
        <TouchableOpacity
          onPress={onTodayPress}
          className="rounded-lg bg-orange-100 px-3 py-1.5"
        >
          <Text className="text-sm font-medium text-orange-600">Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
