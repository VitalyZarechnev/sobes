import { EMPTY_STATE, type JournalEntry, type ProgressState, type QuizProgress, type ReviewItem } from './types';

type UnknownRecord = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const filterRecord = <T,>(value: unknown, isValid: (item: unknown) => item is T): Record<string, T> =>
  isRecord(value) ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, T] => isValid(entry[1]))) : {};

const isTrue = (value: unknown): value is true => value === true;
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

const toQuizProgress = (value: unknown): QuizProgress | null =>
  isRecord(value)
    ? {
        answers: filterRecord(value.answers, isBoolean),
        tasks: filterRecord(value.tasks, isBoolean),
        updatedAt: isFiniteNumber(value.updatedAt) ? value.updatedAt : 0,
      }
    : null;

const isJournalEntry = (value: unknown): value is JournalEntry =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.date === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
  isFiniteNumber(value.hours) &&
  typeof value.done === 'string' &&
  typeof value.understood === 'string' &&
  typeof value.struggling === 'string' &&
  isFiniteNumber(value.rating);

const isReviewItem = (value: unknown): value is ReviewItem =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.text === 'string' &&
  typeof value.resolved === 'boolean' &&
  isFiniteNumber(value.createdAt);

export const parseProgressState = (value: unknown): ProgressState | null => {
  if (!isRecord(value) || value.version !== EMPTY_STATE.version) return null;
  const quizzes = isRecord(value.quizzes)
    ? Object.fromEntries(
        Object.entries(value.quizzes).flatMap(([id, quiz]) => {
          const progress = toQuizProgress(quiz);
          return progress ? [[id, progress] as const] : [];
        }),
      )
    : {};
  return {
    version: EMPTY_STATE.version,
    checks: filterRecord(value.checks, isTrue),
    quizzes,
    journal: Array.isArray(value.journal) ? value.journal.filter(isJournalEntry) : [],
    review: Array.isArray(value.review) ? value.review.filter(isReviewItem) : [],
  };
};
