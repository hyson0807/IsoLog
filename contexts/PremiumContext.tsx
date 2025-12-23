import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';
import { getOrCreateDeviceId } from '@/utils/deviceId';
import { getRevenueCatApiKey, ENTITLEMENT_ID } from '@/constants/revenuecat';

const PREMIUM_STORAGE_KEY = '@isoLog/premium_data';

interface NotificationTime {
  hour: number;
  minute: number;
}

interface PremiumStorageData {
  isPremium: boolean;
  purchaseDate: string | null;
  notificationEnabled: boolean;
  notificationTime?: NotificationTime;
  medicationReminderEnabled?: boolean;
  skinConditionReminderEnabled?: boolean;
  skinConditionReminderTime?: NotificationTime;
}

interface PremiumContextValue {
  // State
  isPremium: boolean;
  deviceId: string | null;
  isLoading: boolean;
  notificationEnabled: boolean;
  notificationTime: NotificationTime;
  medicationReminderEnabled: boolean;
  skinConditionReminderEnabled: boolean;
  skinConditionReminderTime: NotificationTime;
  purchaseDate: string | null;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;

  // Actions
  setPremiumStatus: (isPremium: boolean) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  setNotificationTime: (hour: number, minute: number) => void;
  setMedicationReminderEnabled: (enabled: boolean) => void;
  setSkinConditionReminderEnabled: (enabled: boolean) => void;
  setSkinConditionReminderTime: (hour: number, minute: number) => void;
  restorePurchase: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
  getOfferings: () => Promise<PurchasesOffering | null>;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

const DEFAULT_NOTIFICATION_TIME: NotificationTime = { hour: 22, minute: 0 };
const DEFAULT_SKIN_CONDITION_TIME: NotificationTime = { hour: 21, minute: 0 };

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabledState] = useState(false);
  const [notificationTime, setNotificationTimeState] = useState<NotificationTime>(DEFAULT_NOTIFICATION_TIME);
  const [medicationReminderEnabled, setMedicationReminderEnabledState] = useState(true);
  const [skinConditionReminderEnabled, setSkinConditionReminderEnabledState] = useState(true);
  const [skinConditionReminderTime, setSkinConditionReminderTimeState] = useState<NotificationTime>(DEFAULT_SKIN_CONDITION_TIME);
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);

  // Check if user has active premium entitlement
  const checkPremiumStatus = useCallback((info: CustomerInfo): boolean => {
    const entitlement = info.entitlements.active[ENTITLEMENT_ID];
    return entitlement !== undefined;
  }, []);

  // Update premium status from CustomerInfo
  const updatePremiumFromCustomerInfo = useCallback(
    async (info: CustomerInfo) => {
      const hasPremium = checkPremiumStatus(info);
      const entitlement = info.entitlements.active[ENTITLEMENT_ID];
      const originalPurchaseDate = entitlement?.originalPurchaseDate ?? null;

      setIsPremium(hasPremium);
      setPurchaseDate(originalPurchaseDate);
      setCustomerInfo(info);

      // Sync to AsyncStorage for offline access
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      const existingData: PremiumStorageData = stored
        ? JSON.parse(stored)
        : { isPremium: false, purchaseDate: null, notificationEnabled: false };

      await AsyncStorage.setItem(
        PREMIUM_STORAGE_KEY,
        JSON.stringify({
          ...existingData,
          isPremium: hasPremium,
          purchaseDate: originalPurchaseDate,
        })
      );
    },
    [checkPremiumStatus]
  );

  // Initialize RevenueCat and load premium status
  useEffect(() => {
    async function initialize() {
      try {
        // Get or create device ID
        const id = await getOrCreateDeviceId();
        setDeviceId(id);

        // Load cached premium status first (for offline support)
        const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
        if (stored) {
          const data: PremiumStorageData = JSON.parse(stored);
          setIsPremium(data.isPremium);
          setPurchaseDate(data.purchaseDate);
          setNotificationEnabledState(data.notificationEnabled);
          if (data.notificationTime) {
            setNotificationTimeState(data.notificationTime);
          }
          // 기본값은 true (기존 사용자 호환)
          setMedicationReminderEnabledState(data.medicationReminderEnabled ?? true);
          setSkinConditionReminderEnabledState(data.skinConditionReminderEnabled ?? true);
          if (data.skinConditionReminderTime) {
            setSkinConditionReminderTimeState(data.skinConditionReminderTime);
          }
        }

        // Skip RevenueCat initialization on web
        if (Platform.OS === 'web') {
          setIsLoading(false);
          return;
        }

        // Configure RevenueCat
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        await Purchases.configure({
          apiKey: getRevenueCatApiKey(),
          appUserID: id,
        });

        // Get initial customer info
        const info = await Purchases.getCustomerInfo();
        await updatePremiumFromCustomerInfo(info);

        // Load offerings
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setCurrentOffering(offerings.current);
        }
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [updatePremiumFromCustomerInfo]);

  // Listen for customer info updates (purchases from other devices, subscription changes, etc.)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const customerInfoUpdateListener = async (info: CustomerInfo) => {
      await updatePremiumFromCustomerInfo(info);
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
    };
  }, [updatePremiumFromCustomerInfo]);

  // 현재 상태를 모두 가져오는 헬퍼 (ref를 사용하여 최신 값 보장)
  const getCurrentData = useCallback((): PremiumStorageData => ({
    isPremium,
    purchaseDate,
    notificationEnabled,
    notificationTime,
    medicationReminderEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
  }), [
    isPremium,
    purchaseDate,
    notificationEnabled,
    notificationTime,
    medicationReminderEnabled,
    skinConditionReminderEnabled,
    skinConditionReminderTime,
  ]);

  // Save notification data to AsyncStorage
  const saveData = useCallback(async (updates: Partial<PremiumStorageData>) => {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      const existingData: PremiumStorageData = stored
        ? JSON.parse(stored)
        : getCurrentData();

      await AsyncStorage.setItem(
        PREMIUM_STORAGE_KEY,
        JSON.stringify({ ...existingData, ...updates })
      );
    } catch {
      // Failed to save premium data
    }
  }, [getCurrentData]);

  // Manual premium status update (for testing or fallback)
  const setPremiumStatus = useCallback(
    (premium: boolean) => {
      const newPurchaseDate = premium ? new Date().toISOString() : null;
      setIsPremium(premium);
      setPurchaseDate(newPurchaseDate);
      saveData({ isPremium: premium, purchaseDate: newPurchaseDate });
    },
    [saveData]
  );

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
    (hour: number, minute: number) => {
      const newTime = { hour, minute };
      setSkinConditionReminderTimeState(newTime);
      saveData({ skinConditionReminderTime: newTime });
    },
    [saveData]
  );

  // Restore purchases from RevenueCat
  const restorePurchase = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const info = await Purchases.restorePurchases();
      await updatePremiumFromCustomerInfo(info);
      return checkPremiumStatus(info);
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return false;
    }
  }, [updatePremiumFromCustomerInfo, checkPremiumStatus]);

  // Manually refresh customer info
  const refreshCustomerInfo = useCallback(async () => {
    if (Platform.OS === 'web') return;

    try {
      const info = await Purchases.getCustomerInfo();
      await updatePremiumFromCustomerInfo(info);
    } catch (error) {
      console.error('Failed to refresh customer info:', error);
    }
  }, [updatePremiumFromCustomerInfo]);

  // Get current offerings
  const getOfferings = useCallback(async (): Promise<PurchasesOffering | null> => {
    if (Platform.OS === 'web') return null;

    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setCurrentOffering(offerings.current);
        return offerings.current;
      }
      return null;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      isPremium,
      deviceId,
      isLoading,
      notificationEnabled,
      notificationTime,
      medicationReminderEnabled,
      skinConditionReminderEnabled,
      skinConditionReminderTime,
      purchaseDate,
      customerInfo,
      currentOffering,
      setPremiumStatus,
      setNotificationEnabled,
      setNotificationTime,
      setMedicationReminderEnabled,
      setSkinConditionReminderEnabled,
      setSkinConditionReminderTime,
      restorePurchase,
      refreshCustomerInfo,
      getOfferings,
    }),
    [
      isPremium,
      deviceId,
      isLoading,
      notificationEnabled,
      notificationTime,
      medicationReminderEnabled,
      skinConditionReminderEnabled,
      skinConditionReminderTime,
      purchaseDate,
      customerInfo,
      currentOffering,
      setPremiumStatus,
      setNotificationEnabled,
      setNotificationTime,
      setMedicationReminderEnabled,
      setSkinConditionReminderEnabled,
      setSkinConditionReminderTime,
      restorePurchase,
      refreshCustomerInfo,
      getOfferings,
    ]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremiumContext() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremiumContext must be used within PremiumProvider');
  }
  return context;
}