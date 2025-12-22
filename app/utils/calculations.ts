import { DailyWeightProjection, UserData, WeightProjection } from '../types';

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + s
 * where s is +5 for males and -161 for females
 */
export function calculateBMR(userData: UserData): number {
  const weightKg = userData.weight * 0.453592; // lbs to kg
  const heightCm = (userData.heightFeet * 12 + userData.heightInches) * 2.54; // inches to cm
  
  const baseBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * userData.age);
  const genderModifier = userData.gender === 'male' ? 5 : -161;
  
  return Math.round(baseBMR + genderModifier);
}

/**
 * Calculate net calorie deficit/surplus per day
 */
export function calculateNetCalories(userData: UserData): number {
  const bmr = calculateBMR(userData);
  const totalCaloriesBurned = bmr + userData.caloriesBurnedExercise;
  const netCalories = userData.caloriesEaten - totalCaloriesBurned;
  
  return netCalories;
}

/**
 * Project weight until goal weight is reached
 * 3500 calories = 1 pound of fat
 * Week 1 is from start date to the Sunday of that week
 * All subsequent weeks are Monday-Sunday
 */
export function projectWeight(userData: UserData): WeightProjection[] {
  const netCaloriesPerDay = calculateNetCalories(userData);
  const projections: WeightProjection[] = [];
  
  let currentWeight = userData.weight;
  const startDate = new Date(userData.startDate || new Date().toISOString());
  
  // Validate date
  if (isNaN(startDate.getTime())) {
    console.warn('Invalid start date, using current date');
    startDate.setTime(new Date().getTime());
  }
  
  // Determine if we're losing or gaining weight
  const isLosingWeight = netCaloriesPerDay < 0;
  const goalWeight = userData.goalWeight;
  
  let week = 1;
  const maxWeeks = 104; // Safety limit: 2 years
  
  // Helper function to get next Monday from a date
  const getNextMonday = (date: Date): Date => {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    result.setDate(result.getDate() + daysUntilMonday);
    return result;
  };
  
  // Get the Sunday of the start date's week (end of week 1)
  const getSundayOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
    result.setDate(result.getDate() + daysUntilSunday);
    return result;
  };
  
  let currentDate = new Date(startDate);
  const firstSunday = getSundayOfWeek(startDate);
  const daysInFirstWeek = Math.ceil((firstSunday.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Week 1: From start date to Sunday
  const weightChangeWeek1 = (netCaloriesPerDay * daysInFirstWeek) / 3500;
  const endWeightWeek1 = currentWeight + weightChangeWeek1;
  
  projections.push({
    week: 1,
    startWeight: Math.round(currentWeight * 10) / 10,
    endWeight: Math.round(endWeightWeek1 * 10) / 10,
    date: startDate.toISOString(),
  });
  
  currentWeight = endWeightWeek1;
  currentDate = getNextMonday(startDate);
  week = 2;
  
  // Continue with full weeks (Monday-Sunday) until goal is reached or max weeks
  while (week <= maxWeeks) {
    const startWeight = currentWeight;
    
    // Calculate weight change for the next week (7 days)
    const weeklyNetCalories = netCaloriesPerDay * 7;
    const weightChange = weeklyNetCalories / 3500;
    const endWeight = currentWeight + weightChange;
    
    projections.push({
      week,
      startWeight: Math.round(startWeight * 10) / 10,
      endWeight: Math.round(endWeight * 10) / 10,
      date: currentDate.toISOString(),
    });
    
    // Check if goal is reached (based on start weight of the week)
    if (isLosingWeight && startWeight <= goalWeight) {
      break;
    } else if (!isLosingWeight && startWeight >= goalWeight) {
      break;
    }
    
    currentWeight = endWeight;
    
    // Move to next Monday
    currentDate.setDate(currentDate.getDate() + 7);
    week++;
  }
  
  return projections;
}

/**
 * Project weight per day for a specific week
 * 3500 calories = 1 pound of fat
 * Week 1 is from start date to Sunday of that week
 * All subsequent weeks are Monday-Sunday
 */
export function projectWeekDaily(userData: UserData, weekNumber: number): DailyWeightProjection[] {
  const netCaloriesPerDay = calculateNetCalories(userData);
  const projections: DailyWeightProjection[] = [];
  
  const startDate = new Date(userData.startDate || new Date().toISOString());
  
  // Validate date
  if (isNaN(startDate.getTime())) {
    console.warn('Invalid start date, using current date');
    startDate.setTime(new Date().getTime());
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyWeightChange = netCaloriesPerDay / 3500;
  
  // Helper to get Sunday of the start date's week
  const getSundayOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
    result.setDate(result.getDate() + daysUntilSunday);
    return result;
  };
  
  // Helper to get next Monday from a date
  const getNextMonday = (date: Date): Date => {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    result.setDate(result.getDate() + daysUntilMonday);
    return result;
  };
  
  let currentWeight = userData.weight;
  let weekStartDate: Date;
  let weekEndDate: Date;
  let daysInWeek: number;
  
  if (weekNumber === 1) {
    // Week 1: from start date to Sunday
    weekStartDate = new Date(startDate);
    weekEndDate = getSundayOfWeek(startDate);
    daysInWeek = Math.ceil((weekEndDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } else {
    // Week N: Monday to Sunday
    const firstSunday = getSundayOfWeek(startDate);
    const firstMonday = getNextMonday(startDate);
    
    weekStartDate = new Date(firstMonday);
    weekStartDate.setDate(firstMonday.getDate() + ((weekNumber - 2) * 7));
    
    weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    daysInWeek = 7;
    
    // Calculate weight at start of this week
    const firstSundayDays = Math.ceil((firstSunday.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysSinceStart = firstSundayDays + ((weekNumber - 2) * 7);
    currentWeight += dailyWeightChange * daysSinceStart;
  }
  
  // Project each day
  const currentDate = new Date(weekStartDate);
  let dayIndex = 0;
  
  while (currentDate <= weekEndDate && dayIndex < daysInWeek) {
    projections.push({
      day: dayIndex,
      weight: Math.round(currentWeight * 10) / 10,
      date: currentDate.toISOString(),
      dayName: dayNames[currentDate.getDay()],
    });
    
    currentWeight += dailyWeightChange;
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }
  
  return projections;
}

/**
 * Get the start and end dates for a specific week
 * Week 1 is from start date to Sunday of that week
 * All subsequent weeks are Monday-Sunday
 */
export function getWeekDateRange(userData: UserData, weekNumber: number): { startDate: string; endDate: string } {
  const startDate = new Date(userData.startDate || new Date().toISOString());
  
  // Validate date
  if (isNaN(startDate.getTime())) {
    console.warn('Invalid start date, using current date');
    startDate.setTime(new Date().getTime());
  }
  
  // Helper to get Sunday of the start date's week
  const getSundayOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
    result.setDate(result.getDate() + daysUntilSunday);
    return result;
  };
  
  // Helper to get next Monday from a date
  const getNextMonday = (date: Date): Date => {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    result.setDate(result.getDate() + daysUntilMonday);
    return result;
  };
  
  let weekStartDate: Date;
  let weekEndDate: Date;
  
  if (weekNumber === 1) {
    // Week 1: from start date to Sunday
    weekStartDate = new Date(startDate);
    weekEndDate = getSundayOfWeek(startDate);
  } else {
    // Week N: Monday to Sunday
    const firstMonday = getNextMonday(startDate);
    
    weekStartDate = new Date(firstMonday);
    weekStartDate.setDate(firstMonday.getDate() + ((weekNumber - 2) * 7));
    
    weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
  }
  
  return {
    startDate: weekStartDate.toISOString().split('T')[0],
    endDate: weekEndDate.toISOString().split('T')[0],
  };
}
