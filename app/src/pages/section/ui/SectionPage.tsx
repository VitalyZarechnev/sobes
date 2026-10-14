import { getPage, sectionPages, SECTIONS } from '@/entities/content';
import { pagesCounter, useProgressState } from '@/entities/progress';
import { quizStats, quizzesOfSection } from '@/entities/quiz';
import { MarkdownView } from '@/widgets/markdown-view';
import { routes } from '@/shared/config';
import { percent } from '@/shared/lib';
import { NotFound, ProgressBar } from '@/shared/ui';

interface SectionPageProps {
  readonly sectionId: string;
  readonly anchor: string | null;
}

export function SectionPage({ sectionId, anchor }: SectionPageProps) {
  const state = useProgressState();
  const section = SECTIONS.find((s) => s.id === sectionId);
  const readme = getPage(`${sectionId}/README`);
  if (!section || !readme) return <NotFound />;

  const counter = pagesCounter(sectionPages(sectionId), state);
  const quizzes = quizzesOfSection(sectionId);

  return (
    <div className="page">
      <div className="page-head">
        <span className="page-head__icon" aria-hidden="true">{section.icon}</span>
        <div className="page-head__progress">
          <ProgressBar done={counter.done} total={counter.total} label={`Прогресс раздела ${section.title}`} />
          <span className="muted">
            {percent(counter.done, counter.total)}% · {counter.done}/{counter.total} пунктов чек-листов
          </span>
        </div>
      </div>
      <MarkdownView page={readme} anchor={anchor} />
      {quizzes.length > 0 && (
        <section className="card">
          <h2>🧪 Тесты раздела</h2>
          <ul className="quiz-list">
            {quizzes.map((quiz) => {
              const s = quizStats(quiz, state.quizzes[quiz.id]);
              return (
                <li key={quiz.id}>
                  <a href={routes.quiz(quiz.id)}>{quiz.title}</a>
                  <span className="muted">
                    {s.answered}/{s.questions} вопросов{s.tasks > 0 && ` · задачи ${s.solved}/${s.tasks}`}
                  </span>
                  <ProgressBar done={s.answered + s.solved} total={s.questions + s.tasks} size="sm" />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
