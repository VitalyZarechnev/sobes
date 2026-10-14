import { useState } from 'react';
import { LEVELS, QUIZZES, type Level } from '@/entities/quiz';
import { QuizRunner, type QuizItem } from '@/widgets/quiz-runner';
import { routes, type ExamQuery } from '@/shared/config';
import { percent, shuffle } from '@/shared/lib';

interface ExamPageProps {
  readonly exam: ExamQuery;
}

const isLevel = (value: string): value is Level => (LEVELS as readonly string[]).includes(value);

const pickQuestions = ({ sections, level, count }: ExamQuery): QuizItem[] => {
  const wanted = isLevel(level) ? level : null;
  const pool = [...QUIZZES.values()]
    .filter((q) => sections.length === 0 || sections.includes(q.section))
    .flatMap((quiz) =>
      quiz.questions
        .map((question) => ({ key: `${quiz.id}#${question.id}`, question }))
        .filter(({ question }) => !wanted || question.level === wanted),
    );
  return shuffle(pool).slice(0, count);
};

export function ExamPage({ exam }: ExamPageProps) {
  const [items] = useState(() => pickQuestions(exam));
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter(Boolean).length;
  const finished = items.length > 0 && answered === items.length;

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <a href={routes.quizzes()}>Тесты</a>
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
          <a className="btn btn--primary" href={routes.quizzes()}>Новый экзамен</a>
        </div>
      )}
      {items.length === 0 ? (
        <p>Нет вопросов под выбранные условия. <a href={routes.quizzes()}>Изменить настройки</a></p>
      ) : (
        <QuizRunner
          items={items}
          tasks={[]}
          answers={answers}
          solvedTasks={{}}
          onAnswer={(key, ok) => setAnswers((prev) => ({ ...prev, [key]: ok }))}
          onTaskSolved={() => {}}
          draftScope="exam"
        />
      )}
    </div>
  );
}
