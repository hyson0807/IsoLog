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

const NOTIFICATION_STORAGE_KEY = '@isoLog/notification_settings';
const LEGACY_PREMIUM_STORAGE_KEY = '@isoLog/premium_data';

interface NotificationTime {
  hour: number;
  minute: number;
}

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
  notificationTime: NotificationTime;
  medicationReminderEnabled: boolean;
  skinConditionReminderEnabled: boolean;
  skinConditionReminderTime: NotificationTime;

  // Actions
  setNotificationEnabled: (enabled: boolean) => void;
  setNotificationTime: (hour: number, minute: number) => void;
  setMedicationReminderEnabled: (enabled: boolean) => void;
  setSkinConditionReminderEnabled: (enabled: boolean) => void;
  setSkinConditionReminderTime: (hour: number, minute: number) => void;
}

const NotificationSettingsContext = createContext<NotificationSettingsContextValue | undefined>(undefined);

const DEFAULT_NOTIFICATION_TIME: NotificationTime = { hour: 22, minute: 0 };
const DEFAULT_SKIN_CONDITION_TIME: NotificationTime = { hour: 21, minute: 0 };

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabledState] = useState(false);
  const [notificationTime, setNotificationTimeState] = useState<NotificationTime>(DEFAULT_NOTIFICATION_TIME);
  const [medicationReminderEnabled, setMedicationReminderEnabledState] = useState(true);
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
          const data: NotificationSettingsStorageData = JSON.parse(stored);
          setNotificationEnabledState(data.notificationEnabled);
          setNotificationTimeState(data.notificationTime ?? DEFAULT_NOTIFICATION_TIME);
          setMedicationReminderEnabledState(data.medicationReminderEnabled ?? true);
          setSkinConditionReminderEnabledState(data.skinConditionReminderEnabled ?? true);
          setSkinConditionReminderTimeState(data.skinConditionReminderTime ?? DEFAULT_SKIN_CONDITION_TIME);
        } else {
          // 2. Try to migrate from legacy premium_data key
          const legacyData = await AsyncStorage.getItem(LEGACY_PREMIUM_STORAGE_KEY);

          if (legacyData) {
            const parsed = JSON.parse(legacyData);
            const notificationData: NotificationSettingsStorageData = {
              notificationEnabled: parsed.notificationEnabled ?? false,
              notificationTime: parsed.notificationTime ?? DEFAULT_NOTIFICATION_TIME,
              medicationReminderEnabled: parsed.medicationReminderEnabled ?? true,
              skinConditionReminderEnabled: parsed.skinConditionReminderEnabled ?? true,
              skinConditionReminderTime: parsed.skinConditionReminderTime ?? DEFAULT_SKIN_CONDITION_TIME,
            };

            // Apply migrated data to state
            setNotificationEnabledState(notificationData.notificationEnabled);
            setNotificationTimeState(notificationData.notificationTime);
            setMedicationReminderEnabledState(notificationData.medicationReminderEnabled);
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

    initialize();
  }, []);

  // Helper to get current data for saving
  const getCurrentData = useCallback((): NotificationSettingsStorageData => ({
    notificationEnabled,
    notificationTime,
    medicationReminderEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
  }), [
    notificationEnabled,
    notificationTime,
    medicationReminderEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
  ]);

  // Save data to AsyncStorage
  const saveData = useCallback(async (updates: Partial<NotificationSettingsStorageData>) => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      const existingData: NotificationSettingsStorageData = stored
        ? JSON.parse(stored)
        : getCurrentData();

      await AsyncStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify({ ...existingData, ...updates })
      );
    } catch {
      // Failed to save notification settings
    }
  }, [getCurrentData]);

  // Toggle notification setting
  const setNotificationEnabled = useCallback(
    (enabled: boolean) => {
      setNotificationEnabledState(enabled);
      saveData({ notificationEnabled: enabled });
    },
    [saveData]
  );

  // Set notification time
  const setNotificationTime = useCallback(
    (hour: number, minute: number) => {
      const newTime = { hour, minute };
      setNotificationTimeState(newTime);
      saveData({ notificationTime: newTime });
    },
    [saveData]
  );

  // Toggle medication reminder setting
  const setMedicationReminderEnabled = useCallback(
    (enabled: boolean) => {
      setMedicationReminderEnabledState(enabled);
      saveData({ medicationReminderEnabled: enabled });
    },
    [saveData]
  );

  // Toggle skin condition reminder setting
  const setSkinConditionReminderEnabled = useCallback(
    (enabled: boolean) => {
      setSkinConditionReminderEnabledState(enabled);
      saveData({ skinConditionReminderEnabled: enabled });
    },
    [saveData]
  );

  // Set skin condition reminder time
  const setSkinConditionReminderTime = useCallback(
    async (hour: number, minute: number) => {
      const newTime = { hour, minute };
      setSkinConditionReminderTimeState(newTime);
      saveData({ skinConditionReminderTime: newTime });
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
      notificationTime,
      medicationReminderEnabled,
      skinConditionReminderEnabled,
      skinConditionReminderTime,
      setNotificationEnabled,
      setNotificationTime,
      setMedicationReminderEnabled,
      setSkinConditionReminderEnabled,
      setSkinConditionReminderTime,
    }),
    [
      isLoading,
      notificationEnabled,
      notificationTime,
      medicationReminderEnabled,
      skinConditionReminderEnabled,
      skinConditionReminderTime,
      setNotificationEnabled,
      setNotificationTime,
      setMedicationReminderEnabled,
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
