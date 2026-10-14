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
import type { Route } from '@/shared/lib';

export function Router({ route }: { readonly route: Route }) {
  const { path, query, anchor } = route;
  if (path === '/' || path === '') return <HomePage />;
  if (path === '/journal') return <JournalPage />;
  if (path === '/quizzes') return <QuizzesPage />;
  if (path === '/exam') return <ExamPage key={query.get('seed') ?? ''} query={query} />;
  if (path === '/search') return <SearchPage query={query.get('q') ?? ''} />;
  if (path === '/algo') return <AlgoPage problemKey={query.get('problem')} />;

  const section = /^\/s\/([\w-]+)$/.exec(path);
  if (section?.[1]) return <SectionPage key={section[1]} sectionId={section[1]} anchor={anchor} />;

  const topic = /^\/p\/(.+)$/.exec(path);
  if (topic?.[1]) return <TopicPage key={topic[1]} pageId={topic[1]} anchor={anchor} />;

  const quiz = /^\/quiz\/(.+)$/.exec(path);
  if (quiz?.[1]) return <QuizPage key={quiz[1]} quizId={quiz[1]} />;

  return <NotFoundPage />;
}
