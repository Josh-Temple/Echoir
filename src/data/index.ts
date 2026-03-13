import aliceData from './alice.json';
import sherlockData from './sherlock.json';
import winnieData from './winnie.json';
import type { SentenceItem } from '../types';

const allItems = [
  ...(aliceData as SentenceItem[]),
  ...(sherlockData as SentenceItem[]),
  ...(winnieData as SentenceItem[]),
];

export const sentenceItems: SentenceItem[] = allItems
  .slice()
  .sort((a, b) => a.unit.localeCompare(b.unit) || a.order - b.order);
