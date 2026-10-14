import { useEffect } from 'react';
import { adjacentTopics, getPage, pageHref, sectionHref, SECTIONS } from '@/entities/content';
import { pageCounter, rememberLastPage, useProgressState } from '@/entities/progress';
import { MarkdownView } from '@/widgets/markdown-view';
import { TopicQuizCard } from '@/widgets/topic-quiz-card';
import { NotFound, ProgressBar } from '@/shared/ui';

interface TopicPageProps {
  readonly pageId: string;
  readonly anchor: string | null;
}

export function TopicPage({ pageId, anchor }: TopicPageProps) {
  const state = useProgressState();
  const page = getPage(pageId);

  useEffect(() => {
    if (page?.sectionId) rememberLastPage(page.id);
    if (page) document.title = `${page.title} · Frontend Interview Wiki`;
  }, [page]);

  if (!page) return <NotFound />;
  const section = SECTIONS.find((s) => s.id === page.sectionId);
  const counter = pageCounter(page, state);
  const { prev, next } = adjacentTopics(page);

  return (
    <div className="page">
      {section && (
        <nav className="breadcrumbs" aria-label="Хлебные крошки">
          <a href={sectionHref(section.id)}>
            {section.icon} {section.title}
          </a>
          <span aria-hidden="true">›</span>
          <span>{page.title}</span>
        </nav>
      )}
      {counter.total > 0 && (
        <div className="page-head__progress page-head__progress--sticky">
          <ProgressBar done={counter.done} total={counter.total} label="Прогресс чек-листа страницы" />
          <span className="muted">
            Чек-лист: {counter.done}/{counter.total}
          </span>
        </div>
      )}
      <TopicQuizCard pageId={page.id} />
      <MarkdownView page={page} anchor={anchor} />
      <TopicQuizCard pageId={page.id} />
      {(prev || next) && (
        <nav className="pager" aria-label="Соседние темы">
          {prev ? <a href={pageHref(prev.id)}>← {prev.title}</a> : <span />}
          {next ? <a href={pageHref(next.id)}>{next.title} →</a> : <span />}
        </nav>
      )}
    </div>
  );
}
