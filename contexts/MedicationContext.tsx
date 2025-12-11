import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FrequencyType,
  MedicationSchedule,
  TodayStatus,
  MedicationStorageData,
} from '@/types/medication';
import { frequencyOptions } from '@/constants/frequency';
import { getToday, isMedicationDay as checkIsMedicationDay } from '@/utils/dateUtils';

const STORAGE_KEY = '@isoCare/medication_data';

interface MedicationContextValue {
  // State
  schedule: MedicationSchedule;
  takenDates: Set<string>;
  firstTakenDate: string | null;
  isLoading: boolean;
  todayStatus: TodayStatus;

  // Actions
  toggleMedication: (date: string) => void;
  updateFrequency: (frequency: FrequencyType) => void;

  // Computed helpers
  isMedicationDay: (date: string) => boolean;
  hasTaken: (date: string) => boolean;
  canEditDate: (date: string) => boolean;
}

const MedicationContext = createContext<MedicationContextValue | undefined>(undefined);

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<MedicationSchedule>({
    frequency: 'every2days',
    referenceDate: getToday(),
  });
  const [takenDates, setTakenDates] = useState<Set<string>>(new Set());
  const [firstTakenDate, setFirstTakenDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = getToday();

  // 주기 일수 계산
  const frequencyDays = useMemo(() => {
    const option = frequencyOptions.find((opt) => opt.type === schedule.frequency);
    return option?.days || 1;
  }, [schedule.frequency]);

  // AsyncStorage에서 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: MedicationStorageData = JSON.parse(stored);
          setSchedule(data.schedule);
          setTakenDates(new Set(data.takenDates));
          setFirstTakenDate(data.firstTakenDate);
        }
      } catch (error) {
        console.error('Failed to load medication data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 데이터 변경 시 AsyncStorage에 저장
  useEffect(() => {
    if (isLoading) return; // 초기 로딩 중에는 저장하지 않음

    async function saveData() {
      try {
        const data: MedicationStorageData = {
          schedule,
          takenDates: Array.from(takenDates),
          firstTakenDate,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save medication data:', error);
      }
    }
    saveData();
  }, [schedule, takenDates, firstTakenDate, isLoading]);

  // 특정 날짜의 복용 상태 토글
  const toggleMedication = useCallback((date: string) => {
    setTakenDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
        // 첫 복용일 설정 (없거나 더 이전 날짜인 경우)
        setFirstTakenDate((prevFirst) => {
          if (!prevFirst || date < prevFirst) {
            return date;
          }
          return prevFirst;
        });
      }
      return newSet;
    });
  }, []);

  // 복용 주기 변경
  const updateFrequency = useCallback((frequency: FrequencyType) => {
    setSchedule((prev) => ({
      ...prev,
      frequency,
      referenceDate: getToday(),
    }));
  }, []);

  // 특정 날짜가 복용일인지 확인
  const isMedicationDay = useCallback(
    (date: string) => checkIsMedicationDay(schedule.referenceDate, frequencyDays, date),
    [schedule.referenceDate, frequencyDays]
  );

  // 특정 날짜에 복용했는지 확인
  const hasTaken = useCallback((date: string) => takenDates.has(date), [takenDates]);

  // 특정 날짜를 수정할 수 있는지 확인 (첫 복용일 이후, 오늘 이전 또는 오늘)
  const canEditDate = useCallback(
    (date: string) => {
      // 미래 날짜는 수정 불가
      if (date > today) return false;

      // 첫 복용일이 없으면 모든 과거/오늘 날짜 수정 가능
      if (!firstTakenDate) return true;

      // 첫 복용일 이전 날짜는 수정 불가
      return date >= firstTakenDate;
    },
    [today, firstTakenDate]
  );

  // 오늘의 상태
  const isTodayMedicationDay = useMemo(
    () => checkIsMedicationDay(schedule.referenceDate, frequencyDays, today),
    [schedule.referenceDate, frequencyDays, today]
  );

  const hasTakenToday = takenDates.has(today);

  const todayStatus: TodayStatus = useMemo(
    () => ({
      isMedicationDay: isTodayMedicationDay,
      hasTakenToday,
    }),
    [isTodayMedicationDay, hasTakenToday]
  );

  const value = useMemo(
    () => ({
      schedule,
      takenDates,
      firstTakenDate,
      isLoading,
      todayStatus,
      toggleMedication,
      updateFrequency,
      isMedicationDay,
      hasTaken,
      canEditDate,
    }),
    [
      schedule,
      takenDates,
      firstTakenDate,
      isLoading,
      todayStatus,
      toggleMedication,
      updateFrequency,
      isMedicationDay,
      hasTaken,
      canEditDate,
    ]
  );

  return <MedicationContext.Provider value={value}>{children}</MedicationContext.Provider>;
}

export function useMedicationContext() {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedicationContext must be used within MedicationProvider');
  }
  return context;
}
