import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { FrequencyType } from '@/types/medication';
import { useMedicationContext } from '@/contexts/MedicationContext';
import { useNotificationSettingsContext } from '@/contexts/NotificationSettingsContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { getToday, getUpcomingMedicationDays } from '@/utils/dateUtils';
import {
  scheduleSkinConditionReminder,
  scheduleUpcomingReminders,
} from '@/services/notificationService';
import { frequencyOptions } from '@/constants/frequency';

import { PageIndicator } from './_components/PageIndicator';
import { WelcomePage } from './_components/WelcomePage';
import { FrequencyPage } from './_components/FrequencyPage';
import { DateSelectPage } from './_components/DateSelectPage';
import { MedicationReminderPage } from './_components/MedicationReminderPage';
import { SkinReminderPage } from './_components/SkinReminderPage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_PAGES = 5;

interface OnboardingData {
  referenceDate: string;
  frequency: FrequencyType | null;
  medicationReminderEnabled: boolean;
  medicationReminderTime: { hour: number; minute: number };
  skinReminderEnabled: boolean;
  skinReminderTime: { hour: number; minute: number };
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { updateFrequency } = useMedicationContext();
  const {
    setNotificationEnabled,
    setNotificationTime,
    setMedicationReminderEnabled,
    setSkinConditionReminderEnabled,
    setSkinConditionReminderTime,
  } = useNotificationSettingsContext();
  const { completeOnboarding } = useOnboarding();

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    referenceDate: getToday(),
    frequency: null,
    medicationReminderEnabled: false,
    medicationReminderTime: { hour: 22, minute: 0 },
    skinReminderEnabled: false,
    skinReminderTime: { hour: 21, minute: 0 },
  });

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCurrentPage(page);
    },
    []
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    }
  }, [currentPage]);

  const handleComplete = useCallback(async () => {
    // 1. Save frequency settings
    const frequency = onboardingData.frequency ?? 'none';
    updateFrequency(frequency, onboardingData.referenceDate);

    // 2. Save notification settings
    const anyReminderEnabled =
      onboardingData.medicationReminderEnabled || onboardingData.skinReminderEnabled;

    if (anyReminderEnabled) {
      setNotificationEnabled(true);
    }

    if (onboardingData.medicationReminderEnabled) {
      setNotificationTime(
        onboardingData.medicationReminderTime.hour,
        onboardingData.medicationReminderTime.minute
      );
    }
    setMedicationReminderEnabled(onboardingData.medicationReminderEnabled);

    setSkinConditionReminderEnabled(onboardingData.skinReminderEnabled);
    if (onboardingData.skinReminderEnabled) {
      setSkinConditionReminderTime(
        onboardingData.skinReminderTime.hour,
        onboardingData.skinReminderTime.minute
      );
    }

    // 3. Schedule notifications directly
    if (onboardingData.medicationReminderEnabled && frequency !== 'none') {
      const frequencyDays = frequencyOptions.find((opt) => opt.type === frequency)?.days || 1;
      const upcomingDays = getUpcomingMedicationDays(
        onboardingData.referenceDate,
        frequencyDays,
        7
      );
      await scheduleUpcomingReminders(
        upcomingDays,
        new Set(),
        true,
        onboardingData.medicationReminderTime.hour,
        onboardingData.medicationReminderTime.minute,
        true
      );
    }

    if (onboardingData.skinReminderEnabled) {
      await scheduleSkinConditionReminder(
        onboardingData.skinReminderTime.hour,
        onboardingData.skinReminderTime.minute
      );
    }

    // 4. Mark onboarding as complete
    await completeOnboarding();

    // 5. Navigate to home
    router.replace('/(tabs)/home');
  }, [
    onboardingData,
    updateFrequency,
    setNotificationEnabled,
    setNotificationTime,
    setMedicationReminderEnabled,
    setSkinConditionReminderEnabled,
    setSkinConditionReminderTime,
    completeOnboarding,
    router,
  ]);

  const updateData = useCallback(<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setOnboardingData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const pages = [
    { key: 'welcome', component: <WelcomePage /> },
    {
      key: 'frequency',
      component: (
        <FrequencyPage
          selectedFrequency={onboardingData.frequency}
          onFrequencyChange={(freq) => updateData('frequency', freq)}
        />
      ),
    },
    {
      key: 'date',
      component: (
        <DateSelectPage
          selectedDate={onboardingData.referenceDate}
          onDateChange={(date) => updateData('referenceDate', date)}
        />
      ),
    },
    {
      key: 'medication',
      component: (
        <MedicationReminderPage
          enabled={onboardingData.medicationReminderEnabled}
          time={onboardingData.medicationReminderTime}
          onEnabledChange={(enabled) => updateData('medicationReminderEnabled', enabled)}
          onTimeChange={(hour, minute) =>
            updateData('medicationReminderTime', { hour, minute })
          }
        />
      ),
    },
    {
      key: 'skin',
      component: (
        <SkinReminderPage
          enabled={onboardingData.skinReminderEnabled}
          time={onboardingData.skinReminderTime}
          onEnabledChange={(enabled) => updateData('skinReminderEnabled', enabled)}
          onTimeChange={(hour, minute) =>
            updateData('skinReminderTime', { hour, minute })
          }
        />
      ),
    },
  ];

  const isLastPage = currentPage === TOTAL_PAGES - 1;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH }}>{item.component}</View>
        )}
        keyExtractor={(item) => item.key}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Footer */}
      <View className="px-6 pb-4">
        {/* Page Indicator */}
        <View className="mb-4">
          <PageIndicator totalPages={TOTAL_PAGES} currentPage={currentPage} />
        </View>

        {/* Action Button */}
        {isLastPage ? (
          <TouchableOpacity
            onPress={handleComplete}
            className="items-center rounded-xl bg-orange-500 py-4"
          >
            <Text className="text-base font-semibold text-white">
              {t('onboarding.complete')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={goToNextPage}
            className="flex-row items-center justify-center rounded-xl bg-orange-500 py-4"
          >
            <Text className="text-base font-semibold text-white">
              {t('onboarding.next')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" className="ml-1" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
