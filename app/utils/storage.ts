import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from '../types';

const STORAGE_KEY = '@just_calories_user_data';

export async function saveUserData(data: UserData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

export async function loadUserData(): Promise<UserData | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure startDate exists
      if (!parsed.startDate) {
        parsed.startDate = new Date().toISOString().split('T')[0];
      }
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
}

export async function clearUserData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
}
