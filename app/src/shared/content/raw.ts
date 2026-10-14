
const WIKI_PREFIX = '../../../../';

const rawMarkdown = import.meta.glob<string>(
  [
    '../../../../**/*.md',
    '!../../../../app/**',
    '!../../../../scripts/**',
    '!../../../../quizzes/**',
    '!../../../../**/node_modules/**',
  ],
  { query: '?raw', import: 'default', eager: true },
);

const rawQuizzes = import.meta.glob<string>('../../../../quizzes/data/**/*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const stripPrefix = (path: string): string => path.slice(WIKI_PREFIX.length);

export const markdownFiles: ReadonlyMap<string, string> = new Map(
  Object.entries(rawMarkdown).map(([path, text]) => [stripPrefix(path), text]),
);

export const quizSources: ReadonlyMap<string, string> = new Map(
  Object.entries(rawQuizzes).map(([path, text]) => [stripPrefix(path).replace(/^quizzes\/data\//, ''), text]),
);
