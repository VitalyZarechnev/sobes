import { useState } from 'react';
import { AVAILABLE_SECTIONS } from '@/entities/content';
import { useProgressState } from '@/entities/progress';
import { QUIZZES, quizStats, quizzesOfSection, sumQuizStats, type Level } from '@/entities/quiz';
import { EXAM_COUNT, routes } from '@/shared/config';
import { navigate, percent } from '@/shared/lib';
import { ProgressBar } from '@/shared/ui';

export function QuizzesPage() {
  const state = useProgressState();
  const sectionsWithQuizzes = AVAILABLE_SECTIONS.filter((s) => quizzesOfSection(s.id).length > 0);
  const [chosen, setChosen] = useState<string[]>(() => sectionsWithQuizzes.map((s) => s.id));
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [count, setCount] = useState<number>(EXAM_COUNT.fallback);

  const totals = sumQuizStats([...QUIZZES.values()].map((q) => quizStats(q, state.quizzes[q.id])));

  const startExam = () =>
    navigate(routes.exam({ sections: chosen, level, count, seed: String(Date.now()) }));

  return (
    <div className="page">
      <h1>🧪 Тесты и экзамен</h1>
      <div className="stats">
        <div className="stat"><b>{percent(totals.answered, totals.questions)}%</b><span>вопросов отвечено ({totals.answered}/{totals.questions})</span></div>
        <div className="stat"><b>{percent(totals.correct, totals.answered)}%</b><span>точность ответов</span></div>
        <div className="stat"><b>{totals.solved}/{totals.tasks}</b><span>задач решено</span></div>
        <div className="stat"><b>{QUIZZES.size}</b><span>тестов</span></div>
      </div>

      <section className="card exam-setup">
        <h2>🎲 Экзамен: случайные вопросы из выбранных разделов</h2>
        <fieldset>
          <legend>Разделы</legend>
          <div className="checks-grid">
            {sectionsWithQuizzes.map((s) => (
              <label key={s.id} className="check-inline">
                <input
                  type="checkbox"
                  checked={chosen.includes(s.id)}
                  onChange={() => setChosen((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]))}
                />
                {s.icon} {s.title}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="exam-setup__row">
          <label>
            Уровень{' '}
            <select value={level} onChange={(e) => setLevel(e.target.value as Level | 'all')}>
              <option value="all">Все</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </label>
          <label>
            Вопросов{' '}
            <input type="number" min={EXAM_COUNT.min} max={EXAM_COUNT.max} value={count} onChange={(e) => setCount(Number(e.target.value) || EXAM_COUNT.fallback)} />
          </label>
          <button className="btn btn--primary" disabled={chosen.length === 0} onClick={startExam}>
            Начать экзамен
          </button>
        </div>
      </section>

      {sectionsWithQuizzes.map((section) => (
        <section key={section.id} className="quiz-group">
          <h2>
            {section.icon} {section.title}
          </h2>
          <ul className="quiz-list">
            {quizzesOfSection(section.id).map((quiz) => {
              const s = quizStats(quiz, state.quizzes[quiz.id]);
              return (
                <li key={quiz.id}>
                  <a href={routes.quiz(quiz.id)}>{quiz.title}</a>
                  <span className="muted">
                    {s.answered > 0 ? `${s.correct}/${s.answered} верно` : 'не начат'} · {s.questions} вопросов
                    {s.tasks > 0 && ` · задачи ${s.solved}/${s.tasks}`}
                  </span>
                  <ProgressBar done={s.answered + s.solved} total={s.questions + s.tasks} size="sm" />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
