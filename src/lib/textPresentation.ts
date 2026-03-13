import type { SentenceItem, TimedRevealPreset } from '../types';

export const timedRevealSeconds: Record<TimedRevealPreset, number> = {
  short: 2,
  medium: 4,
  long: 6
};

export const getShadowCue = (item: SentenceItem): string => {
  if (item.chunks && item.chunks.length > 0) {
    return item.chunks[0];
  }

  const words = item.text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).join(' ');
};
