import { useState, useCallback, useMemo } from 'react';
import { FrequencyType, MedicationSchedule, TodayStatus } from '@/types/medication';
import { frequencyOptions } from '@/constants/frequency';
import { getToday, isMedicationDay as checkIsMedicationDay } from '@/utils/dateUtils';

interface UseMedicationScheduleReturn {
  schedule: MedicationSchedule;
  todayStatus: TodayStatus;
  hasTakenToday: boolean;
  toggleTodayMedication: () => void;
  updateFrequency: (frequency: FrequencyType) => void;
}

export function useMedicationSchedule(): UseMedicationScheduleReturn {
  // TODO: Replace with persistent storage (AsyncStorage or similar)
  const [schedule, setSchedule] = useState<MedicationSchedule>({
    frequency: 'every2days',
    referenceDate: getToday(),
  });

  const [takenDates, setTakenDates] = useState<Set<string>>(new Set());

  const today = getToday();

  const frequencyDays = useMemo(() => {
    const option = frequencyOptions.find((opt) => opt.type === schedule.frequency);
    return option?.days || 1;
  }, [schedule.frequency]);

  const isMedicationDay = useMemo(() => {
    return checkIsMedicationDay(schedule.referenceDate, frequencyDays, today);
  }, [schedule.referenceDate, frequencyDays, today]);

  const hasTakenToday = takenDates.has(today);

  const todayStatus: TodayStatus = useMemo(() => ({
    isMedicationDay,
    hasTakenToday,
  }), [isMedicationDay, hasTakenToday]);

  const toggleTodayMedication = useCallback(() => {
    setTakenDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(today)) {
        newSet.delete(today);
      } else {
        newSet.add(today);
      }
      return newSet;
    });
  }, [today]);

  const updateFrequency = useCallback((frequency: FrequencyType) => {
    setSchedule((prev) => ({
      ...prev,
      frequency,
      referenceDate: getToday(), // Reset reference date when frequency changes
    }));
  }, []);

  return {
    schedule,
    todayStatus,
    hasTakenToday,
    toggleTodayMedication,
    updateFrequency,
  };
}