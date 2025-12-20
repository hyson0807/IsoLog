import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  getDetailedPermissionStatus,
  type PermissionStatus,
} from '@/services/notificationService';

interface UseNotificationPermissionResult {
  hasPermission: boolean | null;
  permissionStatus: PermissionStatus | null;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  recheckPermission: () => Promise<void>;
}

export function useNotificationPermission(): UseNotificationPermissionResult {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermission = useCallback(async () => {
    const status = await getDetailedPermissionStatus();
    setPermissionStatus(status);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    const granted = await requestNotificationPermission();
    // 권한 요청 후 상태 다시 확인
    await checkPermission();
    return granted;
  }, [checkPermission]);

  // 설정에서 돌아왔을 때 권한 상태 다시 확인
  const recheckPermission = useCallback(async () => {
    await checkPermission();
  }, [checkPermission]);

  return {
    hasPermission: permissionStatus === 'granted',
    permissionStatus,
    isLoading,
    requestPermission,
    recheckPermission,
  };
}
