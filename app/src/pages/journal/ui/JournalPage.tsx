import { useState, type FormEvent } from 'react';
import { progressActions, useProgressState, type JournalEntry } from '@/entities/progress';
import { pluralRu } from '@/shared/lib';

const today = (): string => new Date().toISOString().slice(0, 10);

type Draft = Omit<JournalEntry, 'id'> & { id?: string };

const emptyDraft = (): Draft => ({ date: today(), hours: 2, done: '', understood: '', struggling: '', rating: 3 });

const streak = (entries: readonly JournalEntry[]): number => {
  const dates = new Set(entries.map((e) => e.date));
  let count = 0;
  const day = new Date();
  if (!dates.has(day.toISOString().slice(0, 10))) day.setDate(day.getDate() - 1);
  while (dates.has(day.toISOString().slice(0, 10))) {
    count += 1;
    day.setDate(day.getDate() - 1);
  }
  return count;
};

export function JournalPage() {
  const state = useProgressState();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [reviewText, setReviewText] = useState('');

  const entries = state.journal.toSorted((a, b) => b.date.localeCompare(a.date));
  const hours = entries.reduce((s, e) => s + e.hours, 0);
  const openReview = state.review.filter((r) => !r.resolved);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.done.trim()) return;
    progressActions.saveJournalEntry(draft);
    if (draft.struggling.trim()) {
      draft.struggling
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => progressActions.addReview(line));
    }
    setDraft(emptyDraft());
  };

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="page">
      <h1>📓 Дневник подготовки</h1>
      <div className="stats">
        <div className="stat"><b>{entries.length}</b><span>{pluralRu(entries.length, ['запись', 'записи', 'записей'])}</span></div>
        <div className="stat"><b>{hours} ч</b><span>всего</span></div>
        <div className="stat"><b>{streak(entries)}</b><span>{pluralRu(streak(entries), ['день', 'дня', 'дней'])} подряд</span></div>
        <div className="stat"><b>{openReview.length}</b><span>тем повторить</span></div>
      </div>

      <div className="journal-grid">
        <form className="card journal-form" onSubmit={save}>
          <h2>{draft.id ? 'Редактирование записи' : 'Новая запись'}</h2>
          <div className="journal-form__row">
            <label>Дата <input type="date" value={draft.date} onChange={(e) => update('date', e.target.value)} required /></label>
            <label>Часов <input type="number" min={0} max={16} step={0.5} value={draft.hours} onChange={(e) => update('hours', Number(e.target.value))} /></label>
            <label>
              Самооценка
              <select value={draft.rating} onChange={(e) => update('rating', Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </label>
          </div>
          <label>Что прошёл <textarea rows={2} value={draft.done} onChange={(e) => update('done', e.target.value)} required placeholder="Темы, тесты, задачи" /></label>
          <label>Что понял <textarea rows={2} value={draft.understood} onChange={(e) => update('understood', e.target.value)} placeholder="1–3 инсайта своими словами" /></label>
          <label>Где плаваю <textarea rows={2} value={draft.struggling} onChange={(e) => update('struggling', e.target.value)} placeholder="Каждая строка попадёт в список «Повторить»" /></label>
          <div className="actions">
            <button className="btn btn--primary" type="submit">Сохранить</button>
            {draft.id && <button className="btn" type="button" onClick={() => setDraft(emptyDraft())}>Отмена</button>}
          </div>
        </form>

        <section className="card">
          <h2>🔁 Повторить</h2>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (reviewText.trim()) progressActions.addReview(reviewText.trim());
              setReviewText('');
            }}
          >
            <input value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Тема, которую нужно повторить" aria-label="Новая тема для повторения" />
            <button className="btn" type="submit">Добавить</button>
          </form>
          <ul className="review-list">
            {state.review.map((item) => (
              <li key={item.id} className={item.resolved ? 'is-done' : ''}>
                <label className="check-inline">
                  <input type="checkbox" checked={item.resolved} onChange={() => progressActions.toggleReview(item.id)} />
                  <span>{item.text}</span>
                </label>
                <button className="btn btn--icon" aria-label="Удалить" onClick={() => progressActions.removeReview(item.id)}>✕</button>
              </li>
            ))}
            {state.review.length === 0 && <li className="muted">Пока пусто. Сюда попадают темы из поля «Где плаваю».</li>}
          </ul>
        </section>
      </div>

      <section>
        <h2>История</h2>
        {entries.length === 0 && <p className="muted">Записей пока нет. Три строки в день — и через неделю будет видно, как растёт уверенность.</p>}
        {entries.map((entry) => (
          <article key={entry.id} className="card journal-entry">
            <header className="question__head">
              <strong>{new Date(entry.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}</strong>
              <span className="muted">{entry.hours} ч · {'★'.repeat(entry.rating)}</span>
            </header>
            <p><b>Прошёл:</b> {entry.done}</p>
            {entry.understood && <p><b>Понял:</b> {entry.understood}</p>}
            {entry.struggling && <p><b>Плаваю:</b> {entry.struggling}</p>}
            <div className="actions">
              <button className="btn btn--ghost" onClick={() => setDraft(entry)}>Редактировать</button>
              <button className="btn btn--ghost" onClick={() => window.confirm('Удалить запись?') && progressActions.removeJournalEntry(entry.id)}>Удалить</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
