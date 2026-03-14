import type { Mode, SelfRating, SentenceItem, SessionSettings } from '../types';

export type HardStage = 'play-first' | 'play-second' | 'reconstruct';

export interface SessionState {
  mode: Mode;
  queue: SentenceItem[];
  index: number;
  replayUsed: number;
  sameDayQueue: SentenceItem[];
  ratings: Record<SelfRating, number>;
  reviewItemsAdded: number;
  audioMessage: string;
  hardStage: HardStage;
  textPeekVisible: boolean;
  textPeekSeen: boolean;
  hardFirstSeen: boolean;
  hardSecondSeen: boolean;
}

export const shuffleItems = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const filterItemsBySettings = (items: SentenceItem[], settings: SessionSettings): SentenceItem[] =>
  items.filter(
    (item) =>
      (settings.units.length === 0 || settings.units.includes(item.unit)) &&
      (settings.levels.length === 0 || settings.levels.includes(item.level))
  );

export const buildSessionQueue = (
  items: SentenceItem[],
  settings: SessionSettings,
  mode: Mode,
  dueIds: string[]
): SentenceItem[] => {
  const filtered = filterItemsBySettings(items, settings);

  if (mode === 'review') {
    const dueSet = new Set(dueIds);
    return filtered.filter((item) => dueSet.has(item.id));
  }

  const ordered = settings.learningOrder === 'original'
    ? [...filtered].sort((a, b) => a.order - b.order)
    : shuffleItems(filtered);

  return ordered.slice(0, settings.sessionSize);
};

export const createSessionState = (mode: Mode, queue: SentenceItem[]): SessionState => ({
  mode,
  queue,
  index: 0,
  replayUsed: 0,
  sameDayQueue: [],
  ratings: { good: 0, close: 0, missed: 0 },
  reviewItemsAdded: 0,
  audioMessage: '',
  hardStage: mode === 'hard' ? 'play-first' : 'reconstruct',
  textPeekVisible: false,
  textPeekSeen: false,
  hardFirstSeen: false,
  hardSecondSeen: false
});

export const getInterferenceItem = (state: SessionState): SentenceItem | null => {
  if (state.mode !== 'hard') return null;
  return state.queue[state.index + 1] ?? null;
};

export const nextTurnState = (state: SessionState): SessionState => ({
  ...state,
  index: state.index + 1,
  replayUsed: 0,
  audioMessage: '',
  hardStage: state.mode === 'hard' ? 'play-first' : 'reconstruct',
  textPeekVisible: false,
  textPeekSeen: false,
  hardFirstSeen: false,
  hardSecondSeen: false
});

export const isSessionEnd = (state: SessionState): boolean => state.index >= state.queue.length - 1;
