import { quizSources } from '@/shared/content/raw';
import type { Quiz } from './types';

const evaluate = (source: string): Quiz[] => {
  const registered: Quiz[] = [];
  const run = new Function('QUIZ', source) as (api: { register: (quiz: Quiz) => void }) => void;
  run({ register: (quiz) => registered.push({ ...quiz, tasks: quiz.tasks ?? [] }) });
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
