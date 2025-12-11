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
import { getOrCreateDeviceId } from '@/utils/deviceId';

const PREMIUM_STORAGE_KEY = '@isoCare/premium_data';

interface PremiumStorageData {
  isPremium: boolean;
  purchaseDate: string | null;
  notificationEnabled: boolean;
}

interface PremiumContextValue {
  // State
  isPremium: boolean;
  deviceId: string | null;
  isLoading: boolean;
  notificationEnabled: boolean;
  purchaseDate: string | null;

  // Actions
  setPremiumStatus: (isPremium: boolean) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  restorePurchase: () => Promise<boolean>;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabledState] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);

  // 앱 시작 시 Device ID 생성/로드 및 프리미엄 상태 확인
  useEffect(() => {
    async function initialize() {
      try {
        // Device ID 가져오기 또는 생성
        const id = await getOrCreateDeviceId();
        setDeviceId(id);

        // 프리미엄 상태 로드
        const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
        if (stored) {
          const data: PremiumStorageData = JSON.parse(stored);
          setIsPremium(data.isPremium);
          setPurchaseDate(data.purchaseDate);
          setNotificationEnabledState(data.notificationEnabled);
        }
      } catch (error) {
        console.error('Failed to initialize premium context:', error);
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, []);

  // 데이터 저장 함수
  const saveData = useCallback(async (data: PremiumStorageData) => {
    try {
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save premium data:', error);
    }
  }, []);

  // 프리미엄 상태 변경
  const setPremiumStatus = useCallback(
    (premium: boolean) => {
      const newPurchaseDate = premium ? new Date().toISOString() : null;
      setIsPremium(premium);
      setPurchaseDate(newPurchaseDate);

      saveData({
        isPremium: premium,
        purchaseDate: newPurchaseDate,
        notificationEnabled,
      });
    },
    [notificationEnabled, saveData]
  );

  // 알림 활성화 상태 변경
  const setNotificationEnabled = useCallback(
    (enabled: boolean) => {
      // 프리미엄 유저만 알림 활성화 가능
      if (!isPremium && enabled) {
        return;
      }

      setNotificationEnabledState(enabled);
      saveData({
        isPremium,
        purchaseDate,
        notificationEnabled: enabled,
      });
    },
    [isPremium, purchaseDate, saveData]
  );

  // 구매 복원 (추후 RevenueCat 연동 시 실제 구현)
  const restorePurchase = useCallback(async (): Promise<boolean> => {
    // TODO: RevenueCat SDK를 사용하여 실제 구매 복원 구현
    // 현재는 placeholder
    try {
      // 실제 구현 시:
      // const customerInfo = await Purchases.restorePurchases();
      // const isPremiumRestored = customerInfo.entitlements.active['premium'] !== undefined;
      // setPremiumStatus(isPremiumRestored);
      // return isPremiumRestored;

      console.log('Restore purchase called - will be implemented with RevenueCat');
      return false;
    } catch (error) {
      console.error('Failed to restore purchase:', error);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      isPremium,
      deviceId,
      isLoading,
      notificationEnabled,
      purchaseDate,
      setPremiumStatus,
      setNotificationEnabled,
      restorePurchase,
    }),
    [
      isPremium,
      deviceId,
      isLoading,
      notificationEnabled,
      purchaseDate,
      setPremiumStatus,
      setNotificationEnabled,
      restorePurchase,
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