import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@isoLog/device_id';

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existingId) {
      return existingId;
    }

    const newId = Crypto.randomUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    return newId;
  } catch {
    // Fallback: generate a temporary ID (not persisted)
    return Crypto.randomUUID();
  }
}

export async function getDeviceId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch {
    return null;
  }
}