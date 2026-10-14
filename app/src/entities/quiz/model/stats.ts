import type { Quiz } from './types';

export interface QuizStats {
  readonly answered: number;
  readonly correct: number;
  readonly questions: number;
  readonly solved: number;
  readonly tasks: number;
}

interface QuizProgressLike {
  readonly answers: Readonly<Record<string, boolean>>;
  readonly tasks: Readonly<Record<string, boolean>>;
}

export const quizStats = (quiz: Quiz, progress: QuizProgressLike | undefined): QuizStats => {
  const answers = progress?.answers ?? {};
  const tasks = progress?.tasks ?? {};
  const answeredKeys = quiz.questions.map((q) => q.id).filter((id) => id in answers);
  return {
    answered: answeredKeys.length,
    correct: answeredKeys.filter((k) => answers[k]).length,
    questions: quiz.questions.length,
    solved: quiz.tasks.filter((t) => tasks[t.id]).length,
    tasks: quiz.tasks.length,
  };
};

const ZERO_STATS: QuizStats = { answered: 0, correct: 0, questions: 0, solved: 0, tasks: 0 };

export const sumQuizStats = (stats: readonly QuizStats[]): QuizStats =>
  stats.reduce(
    (acc, s) => ({
      answered: acc.answered + s.answered,
      correct: acc.correct + s.correct,
      questions: acc.questions + s.questions,
      solved: acc.solved + s.solved,
      tasks: acc.tasks + s.tasks,
    }),
    ZERO_STATS,
  );
