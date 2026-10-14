import { useMemo, useState } from 'react';
import { pageHref } from '@/entities/content';
import { progressActions, useProgressState } from '@/entities/progress';
import { DIFFICULTY_LABEL, quizzesOfSection, type Difficulty, type Task } from '@/entities/quiz';
import { TaskCard } from '@/features/run-task-tests';
import { percent } from '@/shared/lib';
import { ProgressBar } from '@/shared/ui';

const ALGO_SECTION = '13-algorithms';

interface Problem {
  readonly quizId: string;
  readonly index: number;
  readonly task: Task;
}

type StatusFilter = 'all' | 'todo' | 'solved';

export function AlgoPage({ problemKey }: { readonly problemKey: string | null }) {
  const state = useProgressState();
  const problems = useMemo<Problem[]>(
    () =>
      quizzesOfSection(ALGO_SECTION).flatMap((quiz) =>
        quiz.tasks.map((task, index) => ({ quizId: quiz.id, index, task })).filter(({ task }) => task.tags?.length),
      ),
    [],
  );
  const [tag, setTag] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const isSolved = (p: Problem) => Boolean(state.quizzes[p.quizId]?.tasks[String(p.index)]);
  const tags = [...new Set(problems.flatMap((p) => p.task.tags ?? []))].toSorted();
  const solvedCount = problems.filter(isSolved).length;

  const selected = problemKey ? problems.find((p) => `${p.quizId}:${p.index}` === problemKey) : undefined;
  if (selected) {
    return (
      <div className="page">
        <nav className="breadcrumbs"><a href="#/algo">Задачи на алгоритмы</a><span aria-hidden="true">›</span><span>{selected.task.title}</span></nav>
        <TaskCard
          task={selected.task}
          index={selected.index}
          draftKey={`${selected.quizId}:${selected.index}`}
          solved={isSolved(selected)}
          onSolvedChange={(v) => progressActions.setTask(selected.quizId, String(selected.index), v)}
        />
      </div>
    );
  }

  const visible = problems.filter(
    (p) =>
      (tag === 'all' || p.task.tags?.includes(tag)) &&
      (difficulty === 'all' || p.task.difficulty === difficulty) &&
      (status === 'all' || (status === 'solved') === isSolved(p)),
  );

  return (
    <div className="page">
      <h1>🧮 Задачи на алгоритмы и структуры данных</h1>
      <p>
        Теория — в разделе <a href={pageHref('13-algorithms/README')}>Алгоритмы и структуры данных</a>. Задачи решаются прямо здесь, с автотестами.
      </p>
      {problems.length === 0 ? (
        <p className="muted">Задачи ещё не добавлены.</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat"><b>{solvedCount}/{problems.length}</b><span>решено</span></div>
            {(['easy', 'medium', 'hard'] as const).map((d) => {
              const all = problems.filter((p) => p.task.difficulty === d);
              return <div key={d} className="stat"><b>{all.filter(isSolved).length}/{all.length}</b><span>{DIFFICULTY_LABEL[d]}</span></div>;
            })}
          </div>
          <div className="tag-progress">
            {tags.map((t) => {
              const all = problems.filter((p) => p.task.tags?.includes(t));
              const done = all.filter(isSolved).length;
              return (
                <button key={t} className={`tag-card ${tag === t ? 'tag-card--active' : ''}`} onClick={() => setTag(tag === t ? 'all' : t)}>
                  <span>#{t}</span>
                  <span className="muted">{done}/{all.length} · {percent(done, all.length)}%</span>
                  <ProgressBar done={done} total={all.length} size="sm" />
                </button>
              );
            })}
          </div>
          <div className="filters">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')} aria-label="Сложность">
              <option value="all">Любая сложность</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Статус">
              <option value="all">Все</option>
              <option value="todo">Нерешённые</option>
              <option value="solved">Решённые</option>
            </select>
            {tag !== 'all' && <button className="chip chip--active" onClick={() => setTag('all')}>#{tag} ✕</button>}
          </div>
          <table className="problems">
            <thead>
              <tr><th scope="col">Статус</th><th scope="col">Задача</th><th scope="col">Сложность</th><th scope="col">Темы</th></tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={`${p.quizId}:${p.index}`}>
                  <td>{isSolved(p) ? '✅' : '⬜'}</td>
                  <td><a href={`#/algo?problem=${encodeURIComponent(`${p.quizId}:${p.index}`)}`}>{p.task.title}</a></td>
                  <td><span className={`difficulty difficulty--${p.task.difficulty ?? 'easy'}`}>{DIFFICULTY_LABEL[p.task.difficulty ?? 'easy']}</span></td>
                  <td className="muted">{p.task.tags?.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
