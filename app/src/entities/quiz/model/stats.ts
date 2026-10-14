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
  const answeredKeys = quiz.questions.map((_, i) => String(i)).filter((k) => k in answers);
  return {
    answered: answeredKeys.length,
    correct: answeredKeys.filter((k) => answers[k]).length,
    questions: quiz.questions.length,
    solved: quiz.tasks.filter((_, i) => tasks[String(i)]).length,
    tasks: quiz.tasks.length,
  };
};
