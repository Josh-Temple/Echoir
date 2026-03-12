import type { AppStorage, HistoryEntry, ReviewQueueEntry, SelfRating, SessionSettings } from '../types';
import { nextDueDate } from './scheduler';

const key = 'echoir.m1.storage';

const defaultSettings: SessionSettings = {
  mode: 'normal',
  sessionSize: 8,
  replayCount: 1,
  units: [],
  levels: []
};

const fallbackState: AppStorage = {
  history: [],
  reviewQueue: [],
  settings: defaultSettings
};

export const loadStorage = (): AppStorage => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallbackState;
    }

    const parsed = JSON.parse(raw) as Partial<AppStorage>;
    return {
      history: parsed.history ?? [],
      reviewQueue: parsed.reviewQueue ?? [],
      settings: {
        ...defaultSettings,
        ...parsed.settings
      }
    };
  } catch {
    return fallbackState;
  }
};

export const saveStorage = (state: AppStorage): void => {
  localStorage.setItem(key, JSON.stringify(state));
};

export const upsertReviewEntry = (
  queue: ReviewQueueEntry[],
  id: string,
  rating: SelfRating,
  attempts: number
): ReviewQueueEntry[] => {
  const dueDate = nextDueDate(rating, attempts);
  const filtered = queue.filter((entry) => entry.id !== id);

  if (!dueDate) {
    return filtered;
  }

  return [
    ...filtered,
    {
      id,
      dueDate,
      attempts,
      lastRating: rating
    }
  ];
};

export const addHistory = (
  history: HistoryEntry[],
  entry: Omit<HistoryEntry, 'reviewedAt'>
): HistoryEntry[] => [...history, { ...entry, reviewedAt: new Date().toISOString() }];

export const getDefaultSettings = (): SessionSettings => ({ ...defaultSettings });
