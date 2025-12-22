export interface UserData {
  age: number;
  weight: number;
  heightFeet: number;
  heightInches: number;
  gender: 'male' | 'female';
  caloriesEaten: number;
  caloriesBurnedExercise: number;
  startDate: string; // ISO date string
  goalWeight: number;
}

export interface WeightProjection {
  week: number;
  startWeight: number;
  endWeight: number;
  date: string; // ISO date string
}

export interface DailyWeightProjection {
  day: number;
  weight: number;
  date: string; // ISO date string
  dayName: string;
}

export interface ActualWeight {
  date: string; // ISO date string (YYYY-MM-DD)
  weight?: number;
  caloriesEaten?: number;
  caloriesBurnedExercise?: number;
}
