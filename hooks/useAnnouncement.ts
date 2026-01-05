import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENT_ANNOUNCEMENT } from '@/constants/announcement';

const STORAGE_KEY = '@isoLog/seen_announcements';

interface UseAnnouncementReturn {
  shouldShowAnnouncement: boolean;
  isLoading: boolean;
  markAsSeen: () => Promise<void>;
}

export function useAnnouncement(): UseAnnouncementReturn {
  const [shouldShowAnnouncement, setShouldShowAnnouncement] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAnnouncement() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const seenIds: string[] = stored ? JSON.parse(stored) : [];

        // 현재 공지사항 ID가 본 목록에 없으면 표시
        if (!seenIds.includes(CURRENT_ANNOUNCEMENT.id)) {
          setShouldShowAnnouncement(true);
        } else {
          setShouldShowAnnouncement(false);
        }
      } catch {
        // 에러 시 표시 안 함
        setShouldShowAnnouncement(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAnnouncement();
  }, []);

  const markAsSeen = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const seenIds: string[] = stored ? JSON.parse(stored) : [];

      if (!seenIds.includes(CURRENT_ANNOUNCEMENT.id)) {
        seenIds.push(CURRENT_ANNOUNCEMENT.id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seenIds));
      }

      setShouldShowAnnouncement(false);
    } catch {
      // Silently fail
      setShouldShowAnnouncement(false);
    }
  }, []);

  return {
    shouldShowAnnouncement,
    isLoading,
    markAsSeen,
  };
}
