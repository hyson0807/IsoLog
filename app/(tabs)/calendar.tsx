import { useState, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CalendarHeader,
  WeekdayRow,
  CalendarGrid,
  MonthlySummary,
  DayDetailSheet,
  FrequencySettingButton,
  FrequencyBottomSheet,
} from '@/components/calendar';
import { AdBanner } from '@/components/common';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { isDateInMonth } from '@/utils/dateUtils';

export default function CalendarScreen() {
  const {
    today,
    takenDates,
    schedule,
    toggleMedication,
    updateFrequency,
    hasTaken,
    canEditDate,
    isMedicationDay,
    isLoading,
    getDrinkingWarningLevel,
    hasDrinkingPlan,
    toggleDrinkingDate,
    getSkinRecord,
    saveSkinRecord,
  } = useMedicationContext();

  const todayDate = useMemo(() => new Date(today + 'T00:00:00'), [today]);

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isFrequencySheetVisible, setIsFrequencySheetVisible] = useState(false);

  // 현재 월이 오늘이 포함된 월인지 확인
  const isCurrentMonth =
    currentMonth.getFullYear() === todayDate.getFullYear() &&
    currentMonth.getMonth() === todayDate.getMonth();

  // 이번 달 복용 횟수 계산
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

  // 날짜 선택
  const handleDayPress = (date: string) => {
    setSelectedDate(date);
  };

  // 복용 상태 토글
  const handleToggle = () => {
    if (selectedDate) {
      toggleMedication(selectedDate);
    }
  };

  // 술 약속 토글
  const handleToggleDrinking = () => {
    if (selectedDate) {
      toggleDrinkingDate(selectedDate);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF6B35" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 상단 배너 광고 */}
      <AdBanner />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더: 월 네비게이션 */}
        <CalendarHeader
          currentDate={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onTodayPress={handleTodayPress}
          showTodayButton={!isCurrentMonth}
        />

        {/* 요일 행 */}
        <WeekdayRow startDay={0} />

        {/* 날짜 그리드 */}
        <CalendarGrid
          year={currentMonth.getFullYear()}
          month={currentMonth.getMonth()}
          startDay={0}
          onDayPress={handleDayPress}
        />

        {/* 월간 요약 */}
        <MonthlySummary takenCount={takenCountThisMonth} />

        {/* 복용 주기 설정 */}
        <View className="mt-4">
          <FrequencySettingButton
            currentFrequency={schedule.frequency}
            onPress={() => setIsFrequencySheetVisible(true)}
          />
        </View>

        {/* 여백 */}
        <View className="h-8" />
      </ScrollView>

      {/* 날짜 상세 바텀시트 */}
      <DayDetailSheet
        visible={!!selectedDate}
        date={selectedDate}
        hasTaken={selectedDate ? hasTaken(selectedDate) : false}
        canEdit={selectedDate ? canEditDate(selectedDate) : false}
        isMedicationDay={selectedDate ? isMedicationDay(selectedDate) : true}
        isDrinkingDate={selectedDate ? hasDrinkingPlan(selectedDate) : false}
        warningLevel={selectedDate ? getDrinkingWarningLevel(selectedDate) : null}
        skinRecord={selectedDate ? getSkinRecord(selectedDate) : undefined}
        onToggle={handleToggle}
        onToggleDrinking={handleToggleDrinking}
        onSaveSkinRecord={saveSkinRecord}
        onClose={() => setSelectedDate(null)}
      />

      {/* 복용 주기 설정 바텀시트 */}
      <FrequencyBottomSheet
        visible={isFrequencySheetVisible}
        currentFrequency={schedule.frequency}
        currentStartDate={schedule.referenceDate}
        onSelect={(frequency, startDate) => {
          updateFrequency(frequency, startDate);
        }}
        onClose={() => setIsFrequencySheetVisible(false)}
      />
    </SafeAreaView>
  );
}
