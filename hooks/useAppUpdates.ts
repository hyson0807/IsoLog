import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';

interface UpdateState {
  isUpdating: boolean;
  error: Error | null;
}

// Check if expo-updates is available (not in Expo Go or web)
const isUpdatesAvailable = (): boolean => {
  if (__DEV__ || Platform.OS === 'web') {
    return false;
  }
  try {
    const Updates = require('expo-updates');
    return Updates && typeof Updates.checkForUpdateAsync === 'function';
  } catch {
    return false;
  }
};

export function useAppUpdates() {
  const [state, setState] = useState<UpdateState>({
    isUpdating: false,
    error: null,
  });

  const checkAndApplyUpdate = useCallback(async () => {
    // Skip if updates not available
    if (!isUpdatesAvailable()) {
      return;
    }

    try {
      const Updates = require('expo-updates');
      setState({ isUpdating: true, error: null });

      // Check for updates
      const checkResult = await Updates.checkForUpdateAsync();

      if (checkResult.isAvailable) {
        // Download the update
        const fetchResult = await Updates.fetchUpdateAsync();

        if (fetchResult.isNew) {
          // Apply the update immediately
          await Updates.reloadAsync();
        }
      }

      setState({ isUpdating: false, error: null });
    } catch (error) {
      console.error('[Updates] Error:', error);
      setState({ isUpdating: false, error: error as Error });
    }
  }, []);

  // Run update check on mount
  useEffect(() => {
    checkAndApplyUpdate();
  }, [checkAndApplyUpdate]);

  return {
    isUpdating: state.isUpdating,
    error: state.error,
    checkAndApplyUpdate,
  };
}
