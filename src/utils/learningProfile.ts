import { storedDayKey } from './calendarDay';
export const LEARNING_LEVELS = ['beginner', 'basic', 'confident'] as const;
export type LearningLevel = (typeof LEARNING_LEVELS)[number];
export const STUDY_MINUTES = [3, 5, 10] as const;
export type StudyMinutes = (typeof STUDY_MINUTES)[number];
export function isTripDate(value: unknown): value is string {
  return (
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && storedDayKey(value) === value
  );
}
