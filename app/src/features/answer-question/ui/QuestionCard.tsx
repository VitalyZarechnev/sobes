import { useId, useMemo, useState } from 'react';
import { LevelBadge, QUESTION_TYPE_LABEL, type Question } from '@/entities/quiz';
import { quizUrlTransform } from '@/entities/content';
import { CodeBlock, InlineMarkdown } from '@/shared/ui';
import { shuffle } from '@/shared/lib';

interface QuestionCardProps {
  readonly question: Question;
  readonly index: number;
  readonly result: boolean | undefined;
  readonly onAnswer: (correct: boolean) => void;
}

const sameSet = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((x) => b.includes(x));

export function QuestionCard({ question, index, result, onAnswer }: QuestionCardProps) {
  const answered = result !== undefined;
  return (
    <article className={`card question ${answered ? (result ? 'is-correct' : 'is-wrong') : ''}`}>
      <header className="question__head">
        <span className="muted">
          #{index + 1} · {QUESTION_TYPE_LABEL[question.type]}
        </span>
        <LevelBadge level={question.level} />
      </header>
      <InlineMarkdown className="question__text" text={question.q} urlTransform={quizUrlTransform} />
      {question.code && <CodeBlock code={question.code} lang={question.lang} />}
      {question.type === 'open' ? (
        <OpenBody question={question} result={result} onAnswer={onAnswer} />
      ) : question.type === 'order' ? (
        <OrderBody question={question} result={result} onAnswer={onAnswer} />
      ) : (
        <ChoiceBody question={question} result={result} onAnswer={onAnswer} />
      )}
      {answered && question.explain && (
        <div className="explain">
          <strong className={result ? 'ok' : 'bad'}>{result ? '✓ Верно' : '✗ Неверно'}</strong>
          <InlineMarkdown text={question.explain} urlTransform={quizUrlTransform} />
        </div>
      )}
      {answered && !question.explain && question.type !== 'open' && (
        <div className="explain">
          <strong className={result ? 'ok' : 'bad'}>{result ? '✓ Верно' : '✗ Неверно'}</strong>
        </div>
      )}
    </article>
  );
}

type BodyProps<Q> = { readonly question: Q; readonly result: boolean | undefined; readonly onAnswer: (ok: boolean) => void };

function ChoiceBody({ question, result, onAnswer }: BodyProps<Extract<Question, { options: readonly string[] }>>) {
  const isMulti = question.type === 'multi';
  const correct = useMemo(() => (Array.isArray(question.answer) ? [...question.answer] : [question.answer as number]), [question]);
  const order = useMemo(() => shuffle(question.options.map((_, i) => i)), [question]);
  const [chosen, setChosen] = useState<number[]>([]);
  const groupName = useId();
  const locked = result !== undefined;
  const shown = locked && chosen.length === 0 ? correct : chosen;

  const submit = (picked: number[]) => {
    setChosen(picked);
    onAnswer(sameSet(picked, correct));
  };

  return (
    <div className="options">
      {order.map((optionIndex) => {
        const isChosen = shown.includes(optionIndex);
        const state = locked ? (correct.includes(optionIndex) ? 'is-correct' : isChosen ? 'is-wrong' : '') : '';
        return (
          <label key={optionIndex} className={`option ${state}`}>
            <input
              type={isMulti ? 'checkbox' : 'radio'}
              name={groupName}
              checked={isChosen}
              disabled={locked}
              onChange={() => {
                if (isMulti) setChosen((prev) => (prev.includes(optionIndex) ? prev.filter((x) => x !== optionIndex) : [...prev, optionIndex]));
                else submit([optionIndex]);
              }}
            />
            <InlineMarkdown text={question.options[optionIndex] ?? ''} urlTransform={quizUrlTransform} />
          </label>
        );
      })}
      {isMulti && !locked && (
        <div className="actions">
          <button className="btn btn--primary" disabled={chosen.length === 0} onClick={() => submit(chosen)}>
            Проверить
          </button>
        </div>
      )}
    </div>
  );
}

function OrderBody({ question, result, onAnswer }: BodyProps<Extract<Question, { type: 'order' }>>) {
  const initial = useMemo(() => {
    const ids = question.items.map((_, i) => i);
    const mixed = shuffle(ids);
    return mixed.every((v, i) => v === i) && mixed.length > 1 ? [...mixed.slice(1), mixed[0] as number] : mixed;
  }, [question]);
  const [current, setCurrent] = useState<number[]>(initial);
  const locked = result !== undefined;
  const view = locked ? question.items.map((_, i) => i) : current;

  const move = (pos: number, dir: -1 | 1) => {
    const next = [...current];
    const target = pos + dir;
    [next[pos], next[target]] = [next[target] as number, next[pos] as number];
    setCurrent(next);
  };

  return (
    <div>
      {locked && <p className="muted">Правильный порядок:</p>}
      <ol className="order-list">
        {view.map((itemIndex, pos) => (
          <li key={itemIndex}>
            <InlineMarkdown text={question.items[itemIndex] ?? ''} urlTransform={quizUrlTransform} />
            {!locked && (
              <span className="order-list__controls">
                <button className="btn btn--icon" aria-label="Выше" disabled={pos === 0} onClick={() => move(pos, -1)}>↑</button>
                <button className="btn btn--icon" aria-label="Ниже" disabled={pos === view.length - 1} onClick={() => move(pos, 1)}>↓</button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!locked && (
        <div className="actions">
          <button className="btn btn--primary" onClick={() => onAnswer(current.every((v, i) => v === i))}>
            Проверить порядок
          </button>
        </div>
      )}
    </div>
  );
}

function OpenBody({ question, result, onAnswer }: BodyProps<Extract<Question, { type: 'open' }>>) {
  const [shown, setShown] = useState(result !== undefined);
  return (
    <div>
      {!shown && <p className="muted">Сначала ответьте вслух, затем сверьтесь с эталоном и честно оцените себя.</p>}
      {!shown ? (
        <div className="actions">
          <button className="btn btn--primary" onClick={() => setShown(true)}>Показать эталон</button>
        </div>
      ) : (
        <div className="explain">
          <strong>Эталонный ответ</strong>
          <InlineMarkdown text={question.answer} urlTransform={quizUrlTransform} />
          {result === undefined && (
            <div className="actions">
              <button className="btn" onClick={() => onAnswer(true)}>✓ Знал</button>
              <button className="btn" onClick={() => onAnswer(false)}>✗ Не знал</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
