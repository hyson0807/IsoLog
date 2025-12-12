import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ko from './ko.json';
import en from './en.json';

const RESOURCES = {
  ko: { translation: ko },
  en: { translation: en },
};

const SUPPORTED_LANGUAGES = ['ko', 'en'];
const STORAGE_KEY = '@isoLog/language_preference';

// Custom language detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // 1. Check for user-selected language in storage
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        return callback(savedLanguage);
      }

      // 2. Get device language
      const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';

      // 3. Return device language if supported, otherwise fallback to English
      if (SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
        return callback(deviceLanguage);
      }
      return callback('en');
    } catch {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Silently fail
    }
  },
};

i18n
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources: RESOURCES,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper to get current language label
export const getLanguageLabel = (lang: string): string => {
  const labels: Record<string, string> = {
    ko: '한국어',
    en: 'English',
  };
  return labels[lang] ?? labels.en;
};

// Export supported languages for settings UI
export const supportedLanguages = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
];
