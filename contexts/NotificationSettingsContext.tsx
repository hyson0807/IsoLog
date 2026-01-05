import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleSkinConditionReminder } from '@/services/notificationService';

// 저장 위치 이름
const NOTIFICATION_STORAGE_KEY = '@isoLog/notification_settings';
// TODO: 2025년 2월 이후 삭제 가능
const LEGACY_PREMIUM_STORAGE_KEY = '@isoLog/premium_data';

// 알림 시간 객체는 시간과 분으로 이루어져있다.
interface NotificationTime {
  hour: number;
  minute: number;
}

// 알림설정에 관한 데이터 저장 형식 ( 알림 활성 유무, 복용유무 알림 시간대, 복용유무 알림 활성 유무, 스킨기록 활성 유무, 스킨기록 알림 시간대 )
interface NotificationSettingsStorageData {
  notificationEnabled: boolean;
  notificationTime: NotificationTime;
  medicationReminderEnabled: boolean;
  skinConditionReminderEnabled: boolean;
  skinConditionReminderTime: NotificationTime;
}

interface NotificationSettingsContextValue {
  // State
  isLoading: boolean;
  notificationEnabled: boolean;
  medicationReminderEnabled: boolean;
  medicationReminderTime: NotificationTime;
  skinConditionReminderEnabled: boolean;
  skinConditionReminderTime: NotificationTime;

  // Actions
  setNotificationEnabled: (enabled: boolean) => void;
  setMedicationReminderEnabled: (enabled: boolean) => void;
  setMedicationReminderTime: (hour: number, minute: number) => void;
  setSkinConditionReminderEnabled: (enabled: boolean) => void;
  setSkinConditionReminderTime: (hour: number, minute: number) => void;
}

const NotificationSettingsContext = createContext<NotificationSettingsContextValue | undefined>(undefined);

const DEFAULT_MEDICATION_REMINDER_TIME: NotificationTime = { hour: 22, minute: 0 };
const DEFAULT_SKIN_CONDITION_TIME: NotificationTime = { hour: 21, minute: 0 };

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabledState] = useState(false);
  const [medicationReminderEnabled, setMedicationReminderEnabledState] = useState(true);
  const [medicationReminderTime, setMedicationReminderTimeState] = useState<NotificationTime>(DEFAULT_MEDICATION_REMINDER_TIME);
  const [skinConditionReminderEnabled, setSkinConditionReminderEnabledState] = useState(true);
  const [skinConditionReminderTime, setSkinConditionReminderTimeState] = useState<NotificationTime>(DEFAULT_SKIN_CONDITION_TIME);

  // Initialize and migrate data if needed
  useEffect(() => {
    async function initialize() {
      try {
        // 1. Try to load from new key first
        const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);

        if (stored) {
          // Already migrated, use new data
          const data: NotificationSettingsStorageData = JSON.parse(stored); //저장된 문자열 데이터를 객체로 복원
          setNotificationEnabledState(data.notificationEnabled); //마스터 토글 on off 상태 저장
          setMedicationReminderEnabledState(data.medicationReminderEnabled ?? true); //복용알림 유무
          setMedicationReminderTimeState(data.notificationTime ?? DEFAULT_MEDICATION_REMINDER_TIME); // 복용알림 시간대 || 기본 시간대
          setSkinConditionReminderEnabledState(data.skinConditionReminderEnabled ?? true); // 스킨기록 알림 유무
          setSkinConditionReminderTimeState(data.skinConditionReminderTime ?? DEFAULT_SKIN_CONDITION_TIME); // 스킨기록 알림 시간대 기본 시간대
        } else {
          // 2. Try to migrate from legacy premium_data key
          const legacyData = await AsyncStorage.getItem(LEGACY_PREMIUM_STORAGE_KEY);

          if (legacyData) {
            const parsed = JSON.parse(legacyData);
            const notificationData: NotificationSettingsStorageData = {
              notificationEnabled: parsed.notificationEnabled ?? false, // 레거시 데이터 또는 false
              notificationTime: parsed.notificationTime ?? DEFAULT_MEDICATION_REMINDER_TIME,
              medicationReminderEnabled: parsed.medicationReminderEnabled ?? true,
              skinConditionReminderEnabled: parsed.skinConditionReminderEnabled ?? true,
              skinConditionReminderTime: parsed.skinConditionReminderTime ?? DEFAULT_SKIN_CONDITION_TIME,
            };

            // Apply migrated data to state
            setNotificationEnabledState(notificationData.notificationEnabled);
            setMedicationReminderEnabledState(notificationData.medicationReminderEnabled);
            setMedicationReminderTimeState(notificationData.notificationTime);
            setSkinConditionReminderEnabledState(notificationData.skinConditionReminderEnabled);
            setSkinConditionReminderTimeState(notificationData.skinConditionReminderTime);

            // Save to new key
            await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notificationData));
          }
          // 3. New user - default values are already set
        }
      } catch (error) {
        console.error('Failed to initialize notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    void initialize();
  }, []);

  // Helper to get current data for saving
  // 현재 설정값들을 하나의 객체로 묶어주는 함수
  const getCurrentData = useCallback((): NotificationSettingsStorageData => ({
    notificationEnabled,
    notificationTime: medicationReminderTime,
    medicationReminderEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
  }), [
    notificationEnabled,
    medicationReminderTime,
    medicationReminderEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
  ]);

  // Save data to AsyncStorage
  const saveData = useCallback(async (updates: Partial<NotificationSettingsStorageData>) => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      const existingData: NotificationSettingsStorageData = stored ? JSON.parse(stored) : getCurrentData();

      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify({ ...existingData, ...updates }) // 역할: 두 객체를 합쳐서 새 객체 만들기, 뒤에 오는 게 앞을 덮어씀!
      );
    } catch {
      // Failed to save notification settings
    }
  }, [getCurrentData]);

  // Toggle notification setting
  const setNotificationEnabled = useCallback(
    (enabled: boolean) => {
      setNotificationEnabledState(enabled);
      void saveData({ notificationEnabled: enabled });
    },
    [saveData]
  );

  // Set medication reminder time
  const setMedicationReminderTime = useCallback(
    (hour: number, minute: number) => {
      const newTime = { hour, minute };
      setMedicationReminderTimeState(newTime);
      void saveData({ notificationTime: newTime });
    },
    [saveData]
  );

  // Toggle medication reminder setting
  const setMedicationReminderEnabled = useCallback(
    (enabled: boolean) => {
      setMedicationReminderEnabledState(enabled);
      void saveData({ medicationReminderEnabled: enabled });
    },
    [saveData]
  );

  // Toggle skin condition reminder setting
  const setSkinConditionReminderEnabled = useCallback(
    (enabled: boolean) => {
      setSkinConditionReminderEnabledState(enabled);
      void saveData({ skinConditionReminderEnabled: enabled });
    },
    [saveData]
  );

  // Set skin condition reminder time
  const setSkinConditionReminderTime = useCallback(
    async (hour: number, minute: number) => {
      const newTime = { hour, minute };
      setSkinConditionReminderTimeState(newTime);
      void saveData({ skinConditionReminderTime: newTime });
      // 알림 직접 재스케줄링
      if (notificationEnabled && skinConditionReminderEnabled) {
        await scheduleSkinConditionReminder(hour, minute);
      }
    },
    [saveData, notificationEnabled, skinConditionReminderEnabled]
  );

  const value = useMemo(
    () => ({
      isLoading,
      notificationEnabled,
      medicationReminderEnabled,
      medicationReminderTime,
      skinConditionReminderEnabled,
      skinConditionReminderTime,
      setNotificationEnabled,
      setMedicationReminderEnabled,
      setMedicationReminderTime,
      setSkinConditionReminderEnabled,
      setSkinConditionReminderTime,
    }),
    [
      isLoading,
      notificationEnabled,
      medicationReminderEnabled,
      medicationReminderTime,
      skinConditionReminderEnabled,
      skinConditionReminderTime,
      setNotificationEnabled,
      setMedicationReminderEnabled,
      setMedicationReminderTime,
      setSkinConditionReminderEnabled,
      setSkinConditionReminderTime,
    ]
  );

  return (
    <NotificationSettingsContext.Provider value={value}>
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettingsContext() {
  const context = useContext(NotificationSettingsContext);
  if (!context) {
    throw new Error('useNotificationSettingsContext must be used within NotificationSettingsProvider');
  }
  return context;
}
