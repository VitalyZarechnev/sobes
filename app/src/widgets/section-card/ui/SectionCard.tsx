import { SECTION_TOPICS, sectionPages, type Section } from '@/entities/content';
import { pagesCounter, useProgressState } from '@/entities/progress';
import { quizStats, quizzesOfSection, sumQuizStats } from '@/entities/quiz';
import { routes } from '@/shared/config';
import { percent } from '@/shared/lib';
import { ProgressBar } from '@/shared/ui';

export function SectionCard({ section }: { readonly section: Section }) {
  const state = useProgressState();
  const counter = pagesCounter(sectionPages(section.id), state);
  const quiz = sumQuizStats(quizzesOfSection(section.id).map((q) => quizStats(q, state.quizzes[q.id])));
  const value = percent(counter.done, counter.total);

  return (
    <a className={`section-card ${value === 100 ? 'section-card--done' : ''}`} href={routes.section(section.id)}>
      <div className="section-card__head">
        <span className="section-card__icon" aria-hidden="true">{section.icon}</span>
        <span className="section-card__title">{section.title}</span>
        <span className="section-card__value">{value}%</span>
      </div>
      <ProgressBar done={counter.done} total={counter.total} label={`Чек-листы раздела ${section.title}`} />
      <div className="section-card__meta muted">
        <span>{SECTION_TOPICS.get(section.id)?.length ?? 0} тем</span>
        <span>
          чек-листы {counter.done}/{counter.total}
        </span>
        {quiz.questions > 0 && (
          <span>
            тесты {quiz.answered}/{quiz.questions}
            {quiz.answered > 0 && ` · ${percent(quiz.correct, quiz.answered)}% верно`}
          </span>
        )}
      </div>
      <span className="section-card__audience">{section.audience}</span>
    </a>
  );
}
