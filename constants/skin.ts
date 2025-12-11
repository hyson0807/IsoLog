import { TroubleLevel, DrynessLevel } from '@/types/medication';

export interface SkinOption<T> {
  value: T;
  label: string;
  emoji: string;
}

export const troubleOptions: SkinOption<TroubleLevel>[] = [
  { value: 'calm', label: '잠잠해요', emoji: '✨' },
  { value: 'few', label: '몇 개 났어요', emoji: '🥲' },
  { value: 'severe', label: '심해졌어요', emoji: '🚨' },
];

export const drynessOptions: SkinOption<DrynessLevel>[] = [
  { value: 'moist', label: '촉촉해요', emoji: '😌' },
  { value: 'normal', label: '보통이에요', emoji: '🙂' },
  { value: 'dry', label: '건조해요', emoji: '🌵' },
];
