import { isLegacyIndexKey, QUIZZES } from '@/entities/quiz/@x/progress';
import type { QuizProgress } from './types';

interface Identified {
  readonly id: string;
}

const remapIndexKeys = (
  record: Readonly<Record<string, boolean>>,
  items: readonly Identified[],
): Record<string, boolean> =>
  Object.fromEntries(
    Object.entries(record).flatMap(([key, value]) => {
      const item = isLegacyIndexKey(key) ? items[Number(key)] : undefined;
      return item ? [[item.id, value] as const] : [];
    }),
  );

export const migrateQuizzesFromV1 = (
  quizzes: Readonly<Record<string, QuizProgress>>,
): Record<string, QuizProgress> =>
  Object.fromEntries(
    Object.entries(quizzes).flatMap(([quizId, progress]) => {
      const quiz = QUIZZES.get(quizId);
      if (!quiz) return [];
      const migrated: QuizProgress = {
        ...progress,
        answers: remapIndexKeys(progress.answers, quiz.questions),
        tasks: remapIndexKeys(progress.tasks, quiz.tasks),
      };
      return [[quizId, migrated] as const];
    }),
  );
