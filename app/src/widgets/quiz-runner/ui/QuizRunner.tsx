import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { LEVEL_LABEL, LEVELS, type Level, type Question, type Task } from '@/entities/quiz';
import { QuestionCard } from '@/features/answer-question';
import { draftKey, TaskCard } from '@/features/run-task-tests';
import { ProgressBar } from '@/shared/ui';

export interface QuizItem {
  readonly key: string;
  readonly question: Question;
}

interface QuizRunnerProps {
  readonly items: readonly QuizItem[];
  readonly tasks: readonly Task[];
  readonly answers: Readonly<Record<string, boolean>>;
  readonly solvedTasks: Readonly<Record<string, boolean>>;
  readonly onAnswer: (key: string, correct: boolean) => void;
  readonly onTaskSolved: (taskId: string, solved: boolean) => void;
  readonly onReset?: () => void;
  readonly draftScope: string;
}

type Tab = 'questions' | 'tasks';

const TABS: readonly Tab[] = ['questions', 'tasks'];

export function QuizRunner({ items, tasks, answers, solvedTasks, onAnswer, onTaskSolved, onReset, draftScope }: QuizRunnerProps) {
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [tab, setTab] = useState<Tab>(items.length > 0 ? 'questions' : 'tasks');
  const tabsId = useId();
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const hasTabs = items.length > 0 && tasks.length > 0;
  const tabId = (t: Tab) => `${tabsId}-${t}-tab`;
  const panelId = `${tabsId}-panel`;

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    const target = event.key === 'Home' ? TABS[0] : event.key === 'End' ? TABS.at(-1) : step ? TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length] : undefined;
    if (!target) return;
    event.preventDefault();
    setTab(target);
    tabRefs.current[target]?.focus();
  };

  const tabLabel = (t: Tab) => (t === 'questions' ? `Вопросы (${visibleItems.length})` : `Задачи (${visibleTasks.length})`);

  const levels = useMemo(
    () => LEVELS.filter((l) => items.some((i) => i.question.level === l) || tasks.some((t) => t.level === l)),
    [items, tasks],
  );
  const visibleItems = items.filter((i) => level === 'all' || i.question.level === level);
  const visibleTasks = tasks.map((task, index) => ({ task, index })).filter(({ task }) => level === 'all' || task.level === level);

  const answered = visibleItems.filter((i) => i.key in answers);
  const correct = answered.filter((i) => answers[i.key]).length;
  const solved = tasks.filter((t) => solvedTasks[t.id]).length;

  return (
    <div className="quiz">
      <div className="quiz__bar">
        <div className="chips" role="group" aria-label="Фильтр по уровню">
          {(['all', ...levels] as const).map((l) => (
            <button key={l} className={`chip ${level === l ? 'chip--active' : ''}`} onClick={() => setLevel(l)}>
              {l === 'all' ? 'Все уровни' : LEVEL_LABEL[l]}
            </button>
          ))}
        </div>
        <div className="quiz__score">
          <ProgressBar done={answered.length} total={visibleItems.length} label="Отвечено вопросов" />
          <span className="muted">
            Отвечено {answered.length}/{visibleItems.length} · верно {correct}
            {tasks.length > 0 && ` · задачи ${solved}/${tasks.length}`}
          </span>
        </div>
        {onReset && (
          <button
            className="btn btn--ghost"
            onClick={() => window.confirm('Сбросить ответы и отметки задач этого теста?') && onReset()}
          >
            Сбросить
          </button>
        )}
      </div>

      {hasTabs && (
        <div className="tabs" role="tablist" aria-label="Содержимое теста">
          {TABS.map((t) => (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[t] = el;
              }}
              id={tabId(t)}
              role="tab"
              aria-selected={tab === t}
              aria-controls={panelId}
              tabIndex={tab === t ? 0 : -1}
              className={`tab ${tab === t ? 'tab--active' : ''}`}
              onClick={() => setTab(t)}
              onKeyDown={onTabKeyDown}
            >
              {tabLabel(t)}
            </button>
          ))}
        </div>
      )}

      <div {...(hasTabs ? { id: panelId, role: 'tabpanel', 'aria-labelledby': tabId(tab) } : {})}>
        {tab === 'questions' &&
          visibleItems.map((item, i) => (
            <QuestionCard
              key={item.key}
              question={item.question}
              index={i}
              result={answers[item.key]}
              onAnswer={(ok) => onAnswer(item.key, ok)}
            />
          ))}

        {tab === 'tasks' &&
          visibleTasks.map(({ task, index }) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              draftKey={draftKey(draftScope, task.id)}
              solved={Boolean(solvedTasks[task.id])}
              onSolvedChange={(value) => onTaskSolved(task.id, value)}
            />
          ))}

        {tab === 'questions' && visibleItems.length === 0 && <p className="muted">Нет вопросов выбранного уровня.</p>}
      </div>
    </div>
  );
}
