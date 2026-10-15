import { HOME_REGIONS, LEARNING_REASONS, HomeRegion, LearningReason, setPrefs } from './prefs';
import {
  isTripDate,
  LEARNING_LEVELS,
  LearningLevel,
  STUDY_MINUTES,
  StudyMinutes,
} from '../utils/learningProfile';
export { isTripDate } from '../utils/learningProfile';
export interface LearningProfile {
  learningReason: LearningReason;
  homeRegion: HomeRegion;
  learningLevel: LearningLevel;
  studyMinutes: StudyMinutes;
  tripDate: string | null;
}
export async function saveLearningProfile(input: LearningProfile): Promise<void> {
  const { learningReason, homeRegion, learningLevel, studyMinutes, tripDate } = input;
  if (
    !LEARNING_REASONS.includes(learningReason) ||
    !HOME_REGIONS.includes(homeRegion) ||
    !LEARNING_LEVELS.includes(learningLevel) ||
    !STUDY_MINUTES.includes(studyMinutes) ||
    (tripDate !== null && !isTripDate(tripDate))
  )
    throw new Error('Invalid learning profile');
  await setPrefs({ learningReason, homeRegion, learningLevel, studyMinutes, tripDate });
}
