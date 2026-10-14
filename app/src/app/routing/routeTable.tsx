import type { ReactNode } from 'react';
import { getPage, SECTIONS } from '@/entities/content';
import { getQuiz } from '@/entities/quiz';
import { AlgoPage } from '@/pages/algo';
import { ExamPage } from '@/pages/exam';
import { HomePage } from '@/pages/home';
import { JournalPage } from '@/pages/journal';
import { NotFoundPage } from '@/pages/not-found';
import { QuizPage } from '@/pages/quiz';
import { QuizzesPage } from '@/pages/quizzes';
import { SearchPage } from '@/pages/search';
import { SectionPage } from '@/pages/section';
import { TopicPage } from '@/pages/topic';
import { parseExamQuery, PATHS } from '@/shared/config';
import { matchPath, type PathParams, type Route } from '@/shared/lib';

interface RouteContext<P extends string> {
  readonly params: PathParams<P>;
  readonly query: URLSearchParams;
  readonly anchor: string | null;
}

interface RouteDefinition<P extends string> {
  readonly path: P;
  readonly title: (context: RouteContext<P>) => string | null;
  readonly render: (context: RouteContext<P>) => ReactNode;
}

export interface ResolvedRoute {
  readonly element: ReactNode;
  readonly title: string | null;
}

type RouteMatcher = (route: Route) => ResolvedRoute | null;

const NOT_FOUND_TITLE = 'Страница не найдена';

const defineRoute =
  <P extends string>({ path, title, render }: RouteDefinition<P>): RouteMatcher =>
  (route) => {
    const params = matchPath(path, route.path);
    if (!params) return null;
    const context: RouteContext<P> = { params, query: route.query, anchor: route.anchor };
    return { element: render(context), title: title(context) };
  };

const ROUTE_TABLE: readonly RouteMatcher[] = [
  defineRoute({
    path: PATHS.home,
    title: () => null,
    render: () => <HomePage />,
  }),
  defineRoute({
    path: PATHS.journal,
    title: () => 'Дневник подготовки',
    render: () => <JournalPage />,
  }),
  defineRoute({
    path: PATHS.quizzes,
    title: () => 'Тесты и экзамен',
    render: () => <QuizzesPage />,
  }),
  defineRoute({
    path: PATHS.exam,
    title: () => 'Экзамен',
    render: ({ query }) => {
      const exam = parseExamQuery(query);
      return <ExamPage key={exam.seed} exam={exam} />;
    },
  }),
  defineRoute({
    path: PATHS.search,
    title: () => 'Поиск',
    render: ({ query }) => <SearchPage query={query.get('q') ?? ''} />,
  }),
  defineRoute({
    path: PATHS.algo,
    title: () => 'Задачи на алгоритмы',
    render: ({ query }) => <AlgoPage problemKey={query.get('problem')} />,
  }),
  defineRoute({
    path: PATHS.section,
    title: ({ params }) => SECTIONS.find((s) => s.id === params.sectionId)?.title ?? NOT_FOUND_TITLE,
    render: ({ params, anchor }) => <SectionPage key={params.sectionId} sectionId={params.sectionId} anchor={anchor} />,
  }),
  defineRoute({
    path: PATHS.topic,
    title: ({ params }) => getPage(params.pageId)?.title ?? NOT_FOUND_TITLE,
    render: ({ params, anchor }) => <TopicPage key={params.pageId} pageId={params.pageId} anchor={anchor} />,
  }),
  defineRoute({
    path: PATHS.quiz,
    title: ({ params }) => {
      const quiz = getQuiz(params.quizId);
      return quiz ? `Тест: ${quiz.title}` : NOT_FOUND_TITLE;
    },
    render: ({ params }) => <QuizPage key={params.quizId} quizId={params.quizId} />,
  }),
];

const NOT_FOUND: ResolvedRoute = { element: <NotFoundPage />, title: NOT_FOUND_TITLE };

export const resolveRoute = (route: Route): ResolvedRoute => {
  for (const match of ROUTE_TABLE) {
    const resolved = match(route);
    if (resolved) return resolved;
  }
  return NOT_FOUND;
};
