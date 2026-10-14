import type { Page } from '@/entities/content/@x/progress';
import type { ProgressState } from '../model/types';

export interface Counter {
  readonly done: number;
  readonly total: number;
}

export const ZERO: Counter = { done: 0, total: 0 };

export const addCounters = (a: Counter, b: Counter): Counter => ({ done: a.done + b.done, total: a.total + b.total });

export const pageCounter = (page: Page, state: ProgressState): Counter => ({
  done: page.checklist.filter((item) => state.checks[item.key]).length,
  total: page.checklist.length,
});

export const pagesCounter = (pages: readonly Page[], state: ProgressState): Counter =>
  pages.map((p) => pageCounter(p, state)).reduce(addCounters, ZERO);
