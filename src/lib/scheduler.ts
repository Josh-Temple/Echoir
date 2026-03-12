import type { SelfRating } from '../types';
import { isoDate } from './date';

const intervalsByAttempt = [1, 3, 7];

export const sameDayRepeatNeeded = (rating: SelfRating): boolean => rating !== 'good';

export const nextDueDate = (rating: SelfRating, attempts: number): string | null => {
  if (rating === 'good') {
    return null;
  }

  const interval = intervalsByAttempt[Math.min(attempts, intervalsByAttempt.length - 1)];
  return isoDate(interval);
};
