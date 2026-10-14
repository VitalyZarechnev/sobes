import { useSyncExternalStore } from 'react';
import { readJson, writeJson } from '@/shared/lib';
import { EMPTY_STATE, type JournalEntry, type ProgressState, type QuizProgress, type ReviewItem } from './types';
import { isCurrentVersion, parseProgressState } from './validate';

const STORAGE_KEY = 'fe-interview-wiki:progress:v1';

const load = (): ProgressState => parseProgressState(readJson<unknown>(STORAGE_KEY, null)) ?? EMPTY_STATE;

const loadAndUpgrade = (): ProgressState => {
  const stored = readJson<unknown>(STORAGE_KEY, null);
  const parsed = parseProgressState(stored);
  if (parsed && !isCurrentVersion(stored)) writeJson(STORAGE_KEY, parsed);
  return parsed ?? EMPTY_STATE;
};

let state: ProgressState = loadAndUpgrade();
let saveFailed = false;
const listeners = new Set<() => void>();

const notify = (): void => listeners.forEach((listener) => listener());

const onStorage = (event: StorageEvent): void => {
  if (event.key !== STORAGE_KEY) return;
  state = load();
  notify();
};

const subscribe = (listener: () => void): (() => void) => {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
};

const setState = (update: (prev: ProgressState) => ProgressState): void => {
  state = update(state);
  saveFailed = !writeJson(STORAGE_KEY, state);
  notify();
};

export const useProgressState = (): ProgressState => useSyncExternalStore(subscribe, () => state);

export const useProgressSaveFailed = (): boolean => useSyncExternalStore(subscribe, () => saveFailed);

const EMPTY_QUIZ: QuizProgress = { answers: {}, tasks: {}, updatedAt: 0 };

const updateQuiz = (quizId: string, update: (prev: QuizProgress) => Partial<QuizProgress>): void =>
  setState((prev) => {
    const current = prev.quizzes[quizId] ?? EMPTY_QUIZ;
    return { ...prev, quizzes: { ...prev.quizzes, [quizId]: { ...current, ...update(current), updatedAt: Date.now() } } };
  });

const newId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const normalizeReviewText = (text: string): string => text.trim().toLowerCase();

export const progressActions = {
  toggleCheck(key: string): void {
    setState((prev) => {
      const { [key]: wasChecked, ...rest } = prev.checks;
      return { ...prev, checks: wasChecked ? rest : { ...prev.checks, [key]: true } };
    });
  },

  setAnswer(quizId: string, questionKey: string, correct: boolean): void {
    updateQuiz(quizId, (q) => ({ answers: { ...q.answers, [questionKey]: correct } }));
  },

  setTask(quizId: string, taskKey: string, solved: boolean): void {
    updateQuiz(quizId, (q) => ({ tasks: { ...q.tasks, [taskKey]: solved } }));
  },

  resetQuiz(quizId: string): void {
    setState((prev) => {
      const { [quizId]: _removed, ...rest } = prev.quizzes;
      return { ...prev, quizzes: rest };
    });
  },

  saveJournalEntry(entry: Omit<JournalEntry, 'id'> & { id?: string }): void {
    setState((prev) => {
      const id = entry.id ?? newId();
      const next: JournalEntry = { ...entry, id };
      const exists = prev.journal.some((e) => e.id === id);
      const journal = exists ? prev.journal.map((e) => (e.id === id ? next : e)) : [next, ...prev.journal];
      return { ...prev, journal };
    });
  },

  removeJournalEntry(id: string): void {
    setState((prev) => ({ ...prev, journal: prev.journal.filter((e) => e.id !== id) }));
  },

  addReviews(texts: readonly string[]): void {
    setState((prev) => {
      const known = new Set(prev.review.filter((r) => !r.resolved).map((r) => normalizeReviewText(r.text)));
      const added: ReviewItem[] = [];
      for (const raw of texts) {
        const text = raw.trim();
        const normalized = normalizeReviewText(text);
        if (!text || known.has(normalized)) continue;
        known.add(normalized);
        added.push({ id: newId(), text, resolved: false, createdAt: Date.now() });
      }
      return added.length > 0 ? { ...prev, review: [...added, ...prev.review] } : prev;
    });
  },

  toggleReview(id: string): void {
    setState((prev) => ({ ...prev, review: prev.review.map((r) => (r.id === id ? { ...r, resolved: !r.resolved } : r)) }));
  },

  removeReview(id: string): void {
    setState((prev) => ({ ...prev, review: prev.review.filter((r) => r.id !== id) }));
  },

  exportJson(): string {
    return JSON.stringify(state, null, 2);
  },

  importJson(json: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('Файл повреждён: это не JSON');
    }
    const next = parseProgressState(parsed);
    if (!next) throw new Error('Файл не похож на экспорт прогресса этой вики');
    setState(() => next);
  },

  resetAll(): void {
    setState(() => EMPTY_STATE);
  },
};
