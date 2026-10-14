import { useMemo } from 'react';
import { AVAILABLE_SECTIONS, contentUrl, getPage, pageHref, PAGES } from '@/entities/content';
import { pagesCounter, progressActions, readLastPage, useProgressState } from '@/entities/progress';
import { QUIZZES, quizStats, sumQuizStats } from '@/entities/quiz';
import { ProgressBackup } from '@/features/progress-backup';
import { SectionCard } from '@/widgets/section-card';
import { routes } from '@/shared/config';
import { percent } from '@/shared/lib';
import { InlineMarkdown, ProgressBar } from '@/shared/ui';
import { parseRoadmapDays } from '../lib/roadmapDays';

export function HomePage() {
  const state = useProgressState();
  const days = useMemo(parseRoadmapDays, []);
  const sectionPagesAll = [...PAGES.values()].filter((p) => p.sectionId);
  const checklist = pagesCounter(sectionPagesAll, state);
  const quizTotals = sumQuizStats([...QUIZZES.values()].map((q) => quizStats(q, state.quizzes[q.id])));
  const daysDone = days.filter((d) => d.items.length > 0 && d.items.every((i) => state.checks[i.key])).length;
  const currentDay = days.find((d) => d.items.some((i) => !state.checks[i.key]));
  const hours = state.journal.reduce((sum, e) => sum + e.hours, 0);
  const lastPageId = readLastPage();
  const lastPage = lastPageId ? getPage(lastPageId) : undefined;

  return (
    <div className="page home">
      <header className="hero">
        <h1>Подготовка к собеседованию Frontend Senior / Lead</h1>
        <p className="muted">
          Теория, вопросы с ответами, тесты с автопроверкой и план по дням. Прогресс сохраняется в этом браузере.
        </p>
        <div className="stats">
          <div className="stat">
            <b>{daysDone}/{days.length}</b>
            <span>дней роадмапа</span>
          </div>
          <div className="stat">
            <b>{percent(checklist.done, checklist.total)}%</b>
            <span>чек-листов ({checklist.done}/{checklist.total})</span>
          </div>
          <div className="stat">
            <b>{quizTotals.answered}/{quizTotals.questions}</b>
            <span>вопросов отвечено{quizTotals.answered > 0 && `, ${percent(quizTotals.correct, quizTotals.answered)}% верно`}</span>
          </div>
          <div className="stat">
            <b>{quizTotals.solved}/{quizTotals.tasks}</b>
            <span>задач решено</span>
          </div>
          <div className="stat">
            <b>{hours} ч</b>
            <span>в дневнике</span>
          </div>
        </div>
        <ProgressBar done={daysDone} total={days.length} label="Прогресс по роадмапу" />
      </header>

      <div className="home__grid">
        {currentDay && (
          <section className="card today">
            <h2>📅 Сегодня: {currentDay.title}</h2>
            <ul className="today__list">
              {currentDay.items.map((item) => (
                <li key={item.key} className={state.checks[item.key] ? 'is-done' : ''}>
                  <input
                    type="checkbox"
                    checked={Boolean(state.checks[item.key])}
                    onChange={() => progressActions.toggleCheck(item.key)}
                    aria-label="Отметить пункт плана"
                  />
                  <InlineMarkdown text={item.text} urlTransform={roadmapUrl} />
                </li>
              ))}
            </ul>
            <a className="btn btn--primary" href={pageHref('ROADMAP')}>Открыть роадмап</a>
          </section>
        )}
        <section className="card">
          <h2>▶ Продолжить</h2>
          {lastPage ? (
            <p>
              Последняя открытая тема: <a href={pageHref(lastPage.id)}>{lastPage.title}</a>
            </p>
          ) : (
            <p className="muted">Начните с роадмапа — он ведёт по разделам день за днём.</p>
          )}
          <div className="actions">
            <a className="btn" href={routes.quizzes()}>🧪 Экзамен по пройденному</a>
            <a className="btn" href={routes.journal()}>📓 Запись в дневник</a>
          </div>
        </section>
      </div>

      <h2 className="section-heading">Разделы</h2>
      <div className="section-grid">
        {AVAILABLE_SECTIONS.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      <section className="card">
        <h2>💾 Прогресс</h2>
        <p className="muted">
          Отметки, ответы тестов и дневник хранятся в localStorage этого браузера. Сохраните файл, чтобы перенести их на другое устройство.
        </p>
        <ProgressBackup />
      </section>
    </div>
  );
}

const roadmapUrl = (href: string): string => contentUrl('ROADMAP', href);
