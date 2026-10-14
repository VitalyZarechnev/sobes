import { useState } from 'react';
import { LevelBadge, type Task } from '@/entities/quiz';
import { quizUrlTransform } from '@/entities/content';
import { CodeBlock, InlineMarkdown } from '@/shared/ui';
import { readString, writeString } from '@/shared/lib';
import { runTests, type TestResult } from '../lib/runTests';
import { CodeEditor } from './CodeEditor';

interface TaskCardProps {
  readonly task: Task;
  readonly index: number;
  readonly draftKey: string;
  readonly solved: boolean;
  readonly onSolvedChange: (solved: boolean) => void;
}

export function TaskCard({ task, index, draftKey, solved, onSolvedChange }: TaskCardProps) {
  const lang = task.lang ?? 'js';
  const runnable = lang === 'js' && (task.tests?.length ?? 0) > 0;
  const storageKey = `fe-interview-wiki:draft:${draftKey}`;
  const [code, setCode] = useState(() => readString(storageKey) ?? task.starter ?? '');
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const updateCode = (value: string) => {
    setCode(value);
    writeString(storageKey, value);
  };

  const run = async () => {
    setRunning(true);
    const res = await runTests(code, task.tests ?? [], task.env === 'browser' ? 'browser' : 'worker');
    setResults(res);
    setRunning(false);
    if (res.every((r) => r.passed)) onSolvedChange(true);
  };

  const passed = results?.filter((r) => r.passed).length ?? 0;

  return (
    <article className={`card task ${solved ? 'is-correct' : ''}`}>
      <header className="question__head">
        <span className="muted">
          Задача {index + 1}
          {runnable ? ' · 🧪 автотесты' : ''}
        </span>
        <LevelBadge level={task.level} />
      </header>
      <h3 className="task__title">{task.title}</h3>
      <InlineMarkdown text={task.prompt} urlTransform={quizUrlTransform} />
      {(runnable || task.starter !== undefined) && <CodeEditor value={code} onChange={updateCode} label={`Решение задачи ${task.title}`} />}
      {results && (
        <ul className="test-results" aria-live="polite">
          {results.map((r, i) => (
            <li key={i} className={r.passed ? 'ok' : 'bad'}>
              {r.passed ? '✓' : '✗'} {r.name}
              {r.error && <span className="test-results__error">{r.error}</span>}
            </li>
          ))}
          <li className={passed === results.length ? 'ok' : 'bad'}>
            <strong>
              {passed}/{results.length} тестов пройдено
            </strong>
          </li>
        </ul>
      )}
      <div className="actions">
        {runnable && (
          <button className="btn btn--primary" disabled={running} onClick={run}>
            {running ? 'Выполняется…' : '▶ Запустить тесты'}
          </button>
        )}
        <button className="btn" onClick={() => setShowSolution((v) => !v)}>
          {showSolution ? 'Скрыть решение' : 'Показать решение'}
        </button>
        {task.starter !== undefined && (
          <button className="btn" onClick={() => updateCode(task.starter ?? '')}>Сбросить код</button>
        )}
        <label className="check-inline">
          <input type="checkbox" checked={solved} onChange={(e) => onSolvedChange(e.target.checked)} /> Решил сам
        </label>
      </div>
      {showSolution && (
        <div className="explain">
          <strong>Решение</strong>
          <CodeBlock code={task.solution} lang={lang} />
          {task.notes && <InlineMarkdown text={task.notes} urlTransform={quizUrlTransform} />}
        </div>
      )}
    </article>
  );
}
