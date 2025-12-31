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
import { getToday } from '@/utils/dateUtils';

import { PageIndicator } from '@/components/onboarding/PageIndicator';
import { WelcomePage } from '@/components/onboarding/WelcomePage';
import { FrequencyPage } from '@/components/onboarding/FrequencyPage';
import { MedicationReminderPage } from '@/components/onboarding/MedicationReminderPage';
import { SkinReminderPage } from '@/components/onboarding/SkinReminderPage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_PAGES = 4;

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
  const { completeOnboarding, skipOnboarding } = useOnboarding();

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    referenceDate: getToday(),
    frequency: null,
    medicationReminderEnabled: true,
    medicationReminderTime: { hour: 22, minute: 0 },
    skinReminderEnabled: true,
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

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      flatListRef.current?.scrollToIndex({ index: currentPage - 1, animated: true });
    }
  }, [currentPage]);

  const handleComplete = useCallback(async () => {
    // 1. Save frequency settings
    const frequency = onboardingData.frequency ?? 'none';
    updateFrequency(frequency, onboardingData.referenceDate);

    // 2. Save notification settings
    if (onboardingData.medicationReminderEnabled) {
      setNotificationEnabled(true);
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

    // 3. Mark onboarding as complete
    await completeOnboarding();

    // 4. Navigate to home
    router.replace('/(tabs)');
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

  const handleSkip = useCallback(async () => {
    await skipOnboarding();
    router.replace('/(tabs)');
  }, [skipOnboarding, router]);

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
          selectedDate={onboardingData.referenceDate}
          selectedFrequency={onboardingData.frequency}
          onDateChange={(date) => updateData('referenceDate', date)}
          onFrequencyChange={(freq) => updateData('frequency', freq)}
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
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        {currentPage > 0 ? (
          <TouchableOpacity onPress={goToPrevPage} className="p-2">
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
        ) : (
          <View className="p-2" style={{ width: 24 }} />
        )}
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-gray-500">{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

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
