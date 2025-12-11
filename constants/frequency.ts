import { FrequencyType } from '@/types/medication';

export interface FrequencyOption {
  type: FrequencyType;
  label: string;
  description: string;
  days: number;
}

export const frequencyOptions: FrequencyOption[] = [
  {
    type: 'daily',
    label: '매일 복용',
    description: '매일 1알씩 복용합니다',
    days: 1,
  },
  {
    type: 'every2days',
    label: '격일 복용',
    description: '2일에 1알씩 복용합니다',
    days: 2,
  },
  {
    type: 'every3days',
    label: '3일에 1알',
    description: '3일에 1알씩 복용합니다',
    days: 3,
  },
  {
    type: 'weekly',
    label: '주 1회',
    description: '일주일에 1알씩 복용합니다',
    days: 7,
  },
];