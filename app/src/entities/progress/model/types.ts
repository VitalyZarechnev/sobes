export interface QuizProgress {
  readonly answers: Readonly<Record<string, boolean>>;
  readonly tasks: Readonly<Record<string, boolean>>;
  readonly updatedAt: number;
}

export interface JournalEntry {
  readonly id: string;
  readonly date: string;
  readonly hours: number;
  readonly done: string;
  readonly understood: string;
  readonly struggling: string;
  readonly rating: number;
}

export interface ReviewItem {
  readonly id: string;
  readonly text: string;
  readonly resolved: boolean;
  readonly createdAt: number;
}

export interface ProgressState {
  readonly version: 1;
  readonly checks: Readonly<Record<string, true>>;
  readonly quizzes: Readonly<Record<string, QuizProgress>>;
  readonly algo: Readonly<Record<string, 'solved' | 'attempted'>>;
  readonly journal: readonly JournalEntry[];
  readonly review: readonly ReviewItem[];
}

export const EMPTY_STATE: ProgressState = {
  version: 1,
  checks: {},
  quizzes: {},
  algo: {},
  journal: [],
  review: [],
};
