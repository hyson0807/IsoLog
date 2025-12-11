import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@isoCare/device_id';

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existingId) {
      return existingId;
    }

    const newId = Crypto.randomUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.error('Failed to get/create device ID:', error);
    // Fallback: generate a temporary ID (not persisted)
    return Crypto.randomUUID();
  }
}

export async function getDeviceId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Failed to get device ID:', error);
    return null;
  }
}