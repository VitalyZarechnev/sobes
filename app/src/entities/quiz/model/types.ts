export type Level = 'middle' | 'senior' | 'lead';

interface BaseQuestion {
  readonly id: string;
  readonly level: Level;
  readonly q: string;
  readonly code?: string;
  readonly lang?: string;
  readonly explain?: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  readonly type: 'single' | 'output';
  readonly options: readonly string[];
  readonly answer: number;
}

export interface MultiQuestion extends BaseQuestion {
  readonly type: 'multi';
  readonly options: readonly string[];
  readonly answer: readonly number[];
}

export interface OrderQuestion extends BaseQuestion {
  readonly type: 'order';
  readonly items: readonly string[];
}

export interface OpenQuestion extends BaseQuestion {
  readonly type: 'open';
  readonly answer: string;
}

export type Question = ChoiceQuestion | MultiQuestion | OrderQuestion | OpenQuestion;

export interface TaskTest {
  readonly name: string;
  readonly code: string;
}

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly level: Level;
  readonly prompt: string;
  readonly starter?: string;
  readonly solution: string;
  readonly notes?: string;
  readonly lang?: string;
  readonly env?: 'browser';
  readonly tests?: readonly TaskTest[];
  readonly difficulty?: Difficulty;
  readonly tags?: readonly string[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABEL: Readonly<Record<Difficulty, string>> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

type WithOptionalId<T> = T extends unknown ? Omit<T, 'id'> & { readonly id?: string } : never;

export type RawQuestion = WithOptionalId<Question>;
export type RawTask = WithOptionalId<Task>;

export interface RawQuiz extends Omit<Quiz, 'questions' | 'tasks'> {
  readonly questions: readonly RawQuestion[];
  readonly tasks?: readonly RawTask[];
}

export interface Quiz {
  readonly id: string;
  readonly section: string;
  readonly title: string;
  readonly order?: number;
  readonly source?: string;
  readonly questions: readonly Question[];
  readonly tasks: readonly Task[];
}

export const LEVELS: readonly Level[] = ['middle', 'senior', 'lead'];

export const LEVEL_LABEL: Readonly<Record<Level, string>> = { middle: 'Middle', senior: 'Senior', lead: 'Lead' };

export const QUESTION_TYPE_LABEL: Readonly<Record<Question['type'], string>> = {
  single: 'Один ответ',
  output: 'Что выведет?',
  multi: 'Несколько ответов',
  order: 'Порядок',
  open: 'Ответ вслух',
};
