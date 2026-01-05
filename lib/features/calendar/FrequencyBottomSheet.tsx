import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Platform, ScrollView, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FrequencyType } from '@/types/medication';
import { frequencyOptions } from '@/constants/frequency';
import { getToday } from '@/utils/dateUtils';
import { getLocales } from 'expo-localization';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 24) / 2.5; // 패딩 40px, gap 24px 고려, 2.5개 보이도록

interface FrequencyBottomSheetProps {
  visible: boolean;
  currentFrequency: FrequencyType;
  currentStartDate?: string;
  onSelect: (frequency: FrequencyType, startDate: string) => void;
  onClose: () => void;
}

// 상대 날짜 텍스트 가져오기
function getRelativeDateText(
  dateString: string,
  today: string,
  t: (key: string) => string
): string | null {
  const targetDate = new Date(dateString + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const diffDays = Math.round(
    (targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return t('frequency.today');
  if (diffDays === 1) return t('frequency.tomorrow');
  if (diffDays === -1) return t('frequency.yesterday');
  return null;
}

// 날짜 포맷
function formatDisplayDate(dateString: string): string {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function FrequencyBottomSheet({
  visible,
  currentFrequency,
  currentStartDate,
  onSelect,
  onClose,
}: FrequencyBottomSheetProps) {
  const { t } = useTranslation();
  const today = getToday();

  // 내부 상태
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyType>(currentFrequency);
  const [selectedDate, setSelectedDate] = useState<string>(currentStartDate ?? today);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // visible이 true로 변경될 때만 상태 초기화
  useEffect(() => {
    if (visible) {
      setSelectedFrequency(currentFrequency);
      setSelectedDate(currentStartDate ?? today);
      setShowDatePicker(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // 빈도 변경 시 즉시 반영 (같은 것 클릭 시 해제 → none으로)
  const handleFrequencyChange = (frequency: FrequencyType) => {
    if (frequency === selectedFrequency) {
      // 이미 선택된 것 클릭 → 복용 안함으로 해제
      setSelectedFrequency('none');
      onSelect('none', selectedDate);
    } else {
      setSelectedFrequency(frequency);
      onSelect(frequency, selectedDate);
    }
  };

  // 날짜 변경 시 즉시 반영
  const handleDateChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const newDate = `${year}-${month}-${day}`;
      setSelectedDate(newDate);
      onSelect(selectedFrequency, newDate);
    }
  };

  const relativeText = getRelativeDateText(selectedDate, today, t);
  const showStartDateSection = selectedFrequency !== 'daily' && selectedFrequency !== 'none';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/50"
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-3xl bg-white px-5 pb-20 pt-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              {t('frequency.title')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* 빈도 리스트 (가로 스크롤) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
            className="-mx-5 px-5"
          >
            {frequencyOptions.map((option) => {
              const isSelected = option.type === selectedFrequency;
              return (
                <TouchableOpacity
                  key={option.type}
                  onPress={() => handleFrequencyChange(option.type)}
                  style={{ width: CARD_WIDTH }}
                  className={`rounded-xl border-2 p-3 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {isSelected && (
                    <View className="absolute right-2 top-2">
                      <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
                    </View>
                  )}
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-orange-600' : 'text-gray-800'
                    }`}
                    numberOfLines={1}
                  >
                    {t(`frequency.${option.type}.label`)}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
                    {t(`frequency.${option.type}.description`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 시작일 섹션 (매일 복용이 아닐 때만) */}
          {showStartDateSection && (
            <>
              <View className="my-5 h-px bg-gray-200" />

              <View>
                <Text className="mb-3 text-sm font-medium text-gray-600">
                  {t('frequency.startDateQuestion')}
                </Text>

                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center rounded-xl border-2 border-gray-200 bg-gray-50 p-4"
                >
                  <Ionicons name="calendar-outline" size={20} color="#666666" />
                  <Text className="ml-2 flex-1 text-base text-gray-800" numberOfLines={1}>
                    {formatDisplayDate(selectedDate)}
                  </Text>
                  {relativeText && (
                    <Text className="text-sm text-orange-500">
                      ({relativeText})
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* iOS DatePicker (인라인) */}
              {Platform.OS === 'ios' && showDatePicker && (
                <View className="mt-4">
                  <DateTimePicker
                    value={new Date(selectedDate + 'T00:00:00')}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    locale={getLocales()[0]?.languageTag ?? 'en-US'}
                    themeVariant="light"
                  />

                </View>
              )}
            </>
          )}

          {/* Android DatePicker (모달) */}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={new Date(selectedDate + 'T00:00:00')}
              mode="date"
              display="default"
              onChange={handleDateChange}
              themeVariant="light"
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
