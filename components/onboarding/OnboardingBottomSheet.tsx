import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FrequencyType } from '@/types/medication';
import { frequencyOptions } from '@/constants/frequency';
import { getToday } from '@/utils/dateUtils';
import { getLocales } from 'expo-localization';

interface OnboardingBottomSheetProps {
  visible: boolean;
  onComplete: (frequency: FrequencyType, startDate: string) => void;
  onSkip: () => void;
}

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

function formatDisplayDate(dateString: string): string {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function OnboardingBottomSheet({
  visible,
  onComplete,
  onSkip,
}: OnboardingBottomSheetProps) {
  const { t } = useTranslation();
  const today = getToday();

  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedFrequency(null);
      setSelectedDate(today);
      setShowDatePicker(false);
    }
  }, [visible, today]);

  const handleFrequencyChange = (frequency: FrequencyType) => {
    setSelectedFrequency(frequency === selectedFrequency ? null : frequency);
  };

  const handleDateChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  };

  const handleStart = () => {
    const frequency = selectedFrequency ?? 'none';
    onComplete(frequency, selectedDate);
  };

  const relativeText = getRelativeDateText(selectedDate, today, t);
  const showStartDateSection =
    selectedFrequency && selectedFrequency !== 'daily' && selectedFrequency !== 'none';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <Pressable className="flex-1 justify-end bg-black/50">
        <Pressable
          className="rounded-t-3xl bg-white px-5 pb-10 pt-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* 헤더 - 환영 메시지 */}
          <View className="mb-6 items-center">
            <Text className="text-2xl font-bold text-gray-900">
              {t('onboarding.welcome')}
            </Text>
            <Text className="mt-2 text-center text-base text-gray-500">
              {t('onboarding.subtitle')}
            </Text>
          </View>

          {/* 빈도 선택 레이블 */}
          <Text className="mb-3 text-sm font-medium text-gray-600">
            {t('onboarding.selectFrequency')}
          </Text>

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
                  className={`w-32 rounded-xl border-2 p-3 ${
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

          {/* 시작일 섹션 (매일이 아닌 주기 선택 시) */}
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
                    <Text className="text-sm text-orange-500">({relativeText})</Text>
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

          {/* 안내 문구 */}
          <View className="mb-4 mt-6 flex-row items-center justify-center">
            <Ionicons name="information-circle-outline" size={16} color="#888888" />
            <Text className="ml-1 text-sm text-gray-500">{t('onboarding.hint')}</Text>
          </View>

          {/* 시작하기 버튼 */}
          <TouchableOpacity
            onPress={handleStart}
            className="items-center rounded-xl bg-orange-500 py-4"
          >
            <Text className="text-base font-semibold text-white">
              {t('onboarding.startButton')}
            </Text>
          </TouchableOpacity>

          {/* 나중에 설정 버튼 */}
          <TouchableOpacity onPress={onSkip} className="mt-3 items-center py-2">
            <Text className="text-sm text-gray-500">{t('onboarding.skipButton')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
