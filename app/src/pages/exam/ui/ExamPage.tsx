import { useMemo, useState } from 'react';
import { QUIZZES, type Level } from '@/entities/quiz';
import { QuizRunner, type QuizItem } from '@/widgets/quiz-runner';
import { buildHref, percent, shuffle } from '@/shared/lib';

interface ExamPageProps {
  readonly query: URLSearchParams;
}

export function ExamPage({ query }: ExamPageProps) {
  const sections = (query.get('sections') ?? '').split(',').filter(Boolean);
  const level = (query.get('level') ?? 'all') as Level | 'all';
  const count = Number(query.get('n')) || 20;
  const seed = query.get('seed') ?? '';

  const items = useMemo<QuizItem[]>(() => {
    const pool = [...QUIZZES.values()]
      .filter((q) => sections.length === 0 || sections.includes(q.section))
      .flatMap((quiz) =>
        quiz.questions
          .map((question, i) => ({ key: `${quiz.id}#${i}`, question }))
          .filter(({ question }) => level === 'all' || question.level === level),
      );
    return shuffle(pool).slice(0, count);
  }, [seed]);

  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter(Boolean).length;
  const finished = items.length > 0 && answered === items.length;

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <a href={buildHref('/quizzes')}>Тесты</a>
        <span aria-hidden="true">›</span>
        <span>Экзамен</span>
      </nav>
      <h1>🎲 Экзамен</h1>
      <p className="muted">Ответы экзамена не сохраняются в прогресс тем — это тренировка «как на собеседовании».</p>
      {finished && (
        <div className={`card result ${percent(correct, answered) >= 80 ? 'is-correct' : 'is-wrong'}`}>
          <h2>
            Результат: {correct}/{answered} ({percent(correct, answered)}%)
          </h2>
          <p>{percent(correct, answered) >= 80 ? 'Отлично, порог 80% пройден.' : 'Ниже 80% — повторите темы, где ошиблись, и пройдите экзамен снова.'}</p>
          <a className="btn btn--primary" href={buildHref('/quizzes')}>Новый экзамен</a>
        </div>
      )}
      {items.length === 0 ? (
        <p>Нет вопросов под выбранные условия. <a href={buildHref('/quizzes')}>Изменить настройки</a></p>
      ) : (
        <QuizRunner
          items={items}
          tasks={[]}
          answers={answers}
          solvedTasks={{}}
          onAnswer={(key, ok) => setAnswers((prev) => ({ ...prev, [key]: ok }))}
          onTaskSolved={() => {}}
          draftPrefix="exam"
        />
      )}
    </div>
  );
}
