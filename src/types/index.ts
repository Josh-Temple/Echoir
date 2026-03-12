export type Mode = 'normal' | 'hard' | 'review';

export type SelfRating = 'good' | 'close' | 'missed';

export interface SentenceItem {
  id: string;
  unit: string;
  level: string;
  order: number;
  text: string;
  audio: string;
  tags?: string[];
}

export interface SessionSettings {
  mode: Exclude<Mode, 'review'>;
  sessionSize: number;
  replayCount: 1 | 2;
  units: string[];
  levels: string[];
}

export interface HistoryEntry {
  id: string;
  mode: Mode;
  selfRating: SelfRating;
  reviewedAt: string;
  reviewDue: string | null;
}

export interface ReviewQueueEntry {
  id: string;
  dueDate: string;
  attempts: number;
  lastRating: SelfRating;
}

export interface AppStorage {
  history: HistoryEntry[];
  reviewQueue: ReviewQueueEntry[];
  settings: SessionSettings;
}
