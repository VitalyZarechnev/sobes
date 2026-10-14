import { quizSources } from '@/shared/content/raw';
import { questionId, taskId } from '../lib/identity';
import type { Quiz, RawQuiz } from './types';

const normalizeQuiz = (quiz: RawQuiz): Quiz => ({
  ...quiz,
  questions: quiz.questions.map((question) => ({ ...question, id: questionId(question) }) as Quiz['questions'][number]),
  tasks: (quiz.tasks ?? []).map((task) => ({ ...task, id: taskId(task) })),
});

const evaluate = (source: string): Quiz[] => {
  const registered: Quiz[] = [];
  const run = new Function('QUIZ', source) as (api: { register: (quiz: RawQuiz) => void }) => void;
  run({ register: (quiz) => registered.push(normalizeQuiz(quiz)) });
  return registered;
};

const buildRegistry = (): Map<string, Quiz> => {
  const map = new Map<string, Quiz>();
  for (const [file, source] of quizSources) {
    try {
      for (const quiz of evaluate(source)) map.set(quiz.id, quiz);
    } catch (error) {
      console.error(`Не удалось загрузить тест ${file}`, error);
    }
  }
  return map;
};

export const QUIZZES: ReadonlyMap<string, Quiz> = buildRegistry();

export const getQuiz = (id: string): Quiz | undefined => QUIZZES.get(id);

export const quizzesOfSection = (sectionId: string): Quiz[] =>
  [...QUIZZES.values()]
    .filter((q) => q.section === sectionId)
    .toSorted((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.id.localeCompare(b.id));
