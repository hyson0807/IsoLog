import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '@/services/notificationService';

interface UseNotificationPermissionResult {
  hasPermission: boolean | null;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useNotificationPermission(): UseNotificationPermissionResult {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      const status = await getNotificationPermissionStatus();
      setHasPermission(status);
      setIsLoading(false);
    }
    checkPermission();
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    setIsLoading(false);
    return granted;
  }, []);

  return {
    hasPermission,
    isLoading,
    requestPermission,
  };
}
