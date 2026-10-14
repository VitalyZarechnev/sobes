import { useMemo, useState } from 'react';
import { LEVEL_LABEL, LEVELS, type Level, type Question, type Task } from '@/entities/quiz';
import { QuestionCard } from '@/features/answer-question';
import { TaskCard } from '@/features/run-task-tests';
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
  readonly onTaskSolved: (index: number, solved: boolean) => void;
  readonly onReset?: () => void;
  readonly draftPrefix: string;
}

type Tab = 'questions' | 'tasks';

export function QuizRunner({ items, tasks, answers, solvedTasks, onAnswer, onTaskSolved, onReset, draftPrefix }: QuizRunnerProps) {
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [tab, setTab] = useState<Tab>(items.length > 0 ? 'questions' : 'tasks');

  const levels = useMemo(
    () => LEVELS.filter((l) => items.some((i) => i.question.level === l) || tasks.some((t) => t.level === l)),
    [items, tasks],
  );
  const visibleItems = items.filter((i) => level === 'all' || i.question.level === level);
  const visibleTasks = tasks.map((task, index) => ({ task, index })).filter(({ task }) => level === 'all' || task.level === level);

  const answered = visibleItems.filter((i) => i.key in answers);
  const correct = answered.filter((i) => answers[i.key]).length;
  const solved = tasks.filter((_, i) => solvedTasks[String(i)]).length;

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

      {items.length > 0 && tasks.length > 0 && (
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'questions'} className={`tab ${tab === 'questions' ? 'tab--active' : ''}`} onClick={() => setTab('questions')}>
            Вопросы ({visibleItems.length})
          </button>
          <button role="tab" aria-selected={tab === 'tasks'} className={`tab ${tab === 'tasks' ? 'tab--active' : ''}`} onClick={() => setTab('tasks')}>
            Задачи ({visibleTasks.length})
          </button>
        </div>
      )}

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
            key={`${draftPrefix}:${index}`}
            task={task}
            index={index}
            draftKey={`${draftPrefix}:${index}`}
            solved={Boolean(solvedTasks[String(index)])}
            onSolvedChange={(value) => onTaskSolved(index, value)}
          />
        ))}

      {tab === 'questions' && visibleItems.length === 0 && <p className="muted">Нет вопросов выбранного уровня.</p>}
    </div>
  );
}
