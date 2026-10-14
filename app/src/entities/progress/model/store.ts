import { useSyncExternalStore } from 'react';
import { readJson, writeJson } from '@/shared/lib';
import { EMPTY_STATE, type JournalEntry, type ProgressState, type QuizProgress, type ReviewItem } from './types';

const STORAGE_KEY = 'fe-interview-wiki:progress:v1';

const isProgressState = (value: unknown): value is ProgressState =>
  typeof value === 'object' && value !== null && (value as { version?: unknown }).version === 1;

const load = (): ProgressState => {
  const stored = readJson<unknown>(STORAGE_KEY, null);
  return isProgressState(stored) ? { ...EMPTY_STATE, ...stored } : EMPTY_STATE;
};

let state: ProgressState = load();
const listeners = new Set<() => void>();

const setState = (update: (prev: ProgressState) => ProgressState): void => {
  state = update(state);
  writeJson(STORAGE_KEY, state);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    state = load();
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

export const useProgressState = (): ProgressState => useSyncExternalStore(subscribe, () => state);

const EMPTY_QUIZ: QuizProgress = { answers: {}, tasks: {}, updatedAt: 0 };

const updateQuiz = (quizId: string, update: (prev: QuizProgress) => Partial<QuizProgress>): void =>
  setState((prev) => {
    const current = prev.quizzes[quizId] ?? EMPTY_QUIZ;
    return { ...prev, quizzes: { ...prev.quizzes, [quizId]: { ...current, ...update(current), updatedAt: Date.now() } } };
  });

const newId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

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

  setAlgoStatus(problemId: string, status: 'solved' | 'attempted' | null): void {
    setState((prev) => {
      const { [problemId]: _old, ...rest } = prev.algo;
      return { ...prev, algo: status ? { ...rest, [problemId]: status } : rest };
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

  addReview(text: string): void {
    const item: ReviewItem = { id: newId(), text, resolved: false, createdAt: Date.now() };
    setState((prev) => ({ ...prev, review: [item, ...prev.review] }));
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
    const parsed: unknown = JSON.parse(json);
    if (!isProgressState(parsed)) throw new Error('Файл не похож на экспорт прогресса этой вики');
    setState(() => ({ ...EMPTY_STATE, ...parsed }));
  },

  resetAll(): void {
    setState(() => EMPTY_STATE);
  },
};
