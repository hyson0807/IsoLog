import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { formatMonthYear, isDateInMonth } from '@/utils/dateUtils';

export default function TrackingScreen() {
  const { t } = useTranslation();
  const { today, takenDates } = useMedicationContext();

  const todayDate = useMemo(() => new Date(today + 'T00:00:00'), [today]);

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  // 현재 월이 오늘이 포함된 월인지 확인
  const isCurrentMonth =
    currentMonth.getFullYear() === todayDate.getFullYear() &&
    currentMonth.getMonth() === todayDate.getMonth();

  // 선택한 달의 복용 횟수 계산
  const takenCountThisMonth = useMemo(() => {
    let count = 0;
    takenDates.forEach((date) => {
      if (isDateInMonth(date, currentMonth.getFullYear(), currentMonth.getMonth())) {
        count++;
      }
    });
    return count;
  }, [takenDates, currentMonth]);

  // 월 이동
  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleTodayPress = () => {
    setCurrentMonth(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더: 월 네비게이션 */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handlePrevMonth}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>

            <Text className="mx-4 text-xl font-bold text-gray-900">
              {formatMonthYear(currentMonth)}
            </Text>

            <TouchableOpacity
              onPress={handleNextMonth}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-forward" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {!isCurrentMonth && (
            <TouchableOpacity
              onPress={handleTodayPress}
              className="rounded-lg bg-orange-100 px-3 py-1.5"
            >
              <Text className="text-sm font-medium text-orange-600">Today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 월간 복용량 카드 */}
        <View className="mx-5 mt-2 rounded-2xl bg-orange-50 p-4">
          <Text className="text-center text-base font-semibold text-orange-600">
            {t('calendar.summary', { count: takenCountThisMonth })}
          </Text>
        </View>

        {/* 추후 피부 기록 통계 등 추가 영역 */}
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-400">{t('common.comingSoon')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
