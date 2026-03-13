import { sameDayRepeatNeeded } from './scheduler';
import { nextTurnState, type SessionState } from './session';
import type { SelfRating, SentenceItem } from '../types';

export interface RatingProgress {
  currentWithRating: SessionState;
  nextState: SessionState;
}

export const applyRatingToSession = (
  state: SessionState,
  promptItem: SentenceItem,
  rating: SelfRating
): RatingProgress => {
  const shouldRepeat = sameDayRepeatNeeded(rating);
  const updatedSameDay = shouldRepeat ? [...state.sameDayQueue, promptItem] : state.sameDayQueue;
  const isQueueEnd = state.index >= state.queue.length - 1;
  const mergedQueue = isQueueEnd && updatedSameDay.length > 0 ? [...state.queue, ...updatedSameDay] : state.queue;

  const currentWithRating: SessionState = {
    ...state,
    queue: mergedQueue,
    sameDayQueue: isQueueEnd ? [] : updatedSameDay,
    ratings: {
      ...state.ratings,
      [rating]: state.ratings[rating] + 1
    },
    reviewItemsAdded: rating === 'good' ? state.reviewItemsAdded : state.reviewItemsAdded + 1
  };

  return {
    currentWithRating,
    nextState: nextTurnState(currentWithRating)
  };
};

export const getRecentAttemptCount = (timestamps: string[]): number => {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return timestamps.filter((t) => now - new Date(t).getTime() <= sevenDaysMs).length;
};
