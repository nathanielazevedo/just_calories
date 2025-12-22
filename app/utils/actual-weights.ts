import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActualWeight } from '../types';

const STORAGE_KEY = '@actual_weights';

/**
 * Save or update an actual data entry (weight, calories, exercise)
 */
export async function saveActualWeight(data: ActualWeight): Promise<void> {
  try {
    const existing = await loadActualWeights();
    const index = existing.findIndex(w => w.date === data.date);
    
    if (index >= 0) {
      // Merge with existing data
      existing[index] = {
        ...existing[index],
        ...data,
      };
    } else {
      existing.push(data);
    }
    
    // Sort by date
    existing.sort((a, b) => a.date.localeCompare(b.date));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving actual weight:', error);
  }
}

/**
 * Load all actual weight entries
 */
export async function loadActualWeights(): Promise<ActualWeight[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading actual weights:', error);
    return [];
  }
}

/**
 * Get actual weight for a specific date
 */
export async function getActualWeight(date: string): Promise<ActualWeight | null> {
  const weights = await loadActualWeights();
  return weights.find(w => w.date === date) || null;
}

/**
 * Delete an actual weight entry
 */
export async function deleteActualWeight(date: string): Promise<void> {
  try {
    const existing = await loadActualWeights();
    const filtered = existing.filter(w => w.date !== date);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting actual weight:', error);
  }
}

/**
 * Clear all actual weights
 */
export async function clearActualWeights(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing actual weights:', error);
  }
}

/**
 * Get the last submitted actual weight for a given week
 * Returns the most recent weight entry within the week's date range
 */
export async function getLastWeightForWeek(weekStartDate: string, weekEndDate: string): Promise<number | null> {
  try {
    const weights = await loadActualWeights();
    
    // Filter weights within the week range that have a weight value
    const weekWeights = weights.filter(w => w.date >= weekStartDate && w.date <= weekEndDate && w.weight !== undefined);
    
    if (weekWeights.length === 0) {
      return null;
    }
    
    // Sort by date descending and return the most recent weight
    weekWeights.sort((a, b) => b.date.localeCompare(a.date));
    return weekWeights[0].weight || null;
  } catch (error) {
    console.error('Error getting last weight for week:', error);
    return null;
  }
}
