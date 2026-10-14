import { buildPath, toHref } from '@/shared/lib';

export const PATHS = {
  home: '/',
  journal: '/journal',
  quizzes: '/quizzes',
  exam: '/exam',
  search: '/search',
  algo: '/algo',
  section: '/s/:sectionId',
  topic: '/p/*pageId',
  quiz: '/quiz/*quizId',
} as const;

export interface ExamQuery {
  readonly sections: readonly string[];
  readonly level: string;
  readonly count: number;
  readonly seed: string;
}

export const EXAM_COUNT = { min: 5, max: 100, fallback: 20 } as const;

const clampCount = (value: number): number =>
  Number.isFinite(value) && value > 0
    ? Math.min(EXAM_COUNT.max, Math.max(EXAM_COUNT.min, Math.round(value)))
    : EXAM_COUNT.fallback;

export const parseExamQuery = (query: URLSearchParams): ExamQuery => ({
  sections: (query.get('sections') ?? '').split(',').filter(Boolean),
  level: query.get('level') ?? 'all',
  count: clampCount(Number(query.get('n'))),
  seed: query.get('seed') ?? '',
});

export const routes = {
  home: (): string => toHref(PATHS.home),
  journal: (): string => toHref(PATHS.journal),
  quizzes: (): string => toHref(PATHS.quizzes),
  exam: ({ sections, level, count, seed }: ExamQuery): string =>
    toHref(PATHS.exam, { query: { sections: sections.join(','), level, n: String(clampCount(count)), seed } }),
  search: (q = ''): string => toHref(PATHS.search, { query: q ? { q } : undefined }),
  algo: (problem?: string): string => toHref(PATHS.algo, { query: problem ? { problem } : undefined }),
  section: (sectionId: string, anchor?: string | null): string =>
    toHref(buildPath(PATHS.section, { sectionId }), { anchor }),
  topic: (pageId: string, anchor?: string | null): string => toHref(buildPath(PATHS.topic, { pageId }), { anchor }),
  quiz: (quizId: string): string => toHref(buildPath(PATHS.quiz, { quizId })),
} as const;
