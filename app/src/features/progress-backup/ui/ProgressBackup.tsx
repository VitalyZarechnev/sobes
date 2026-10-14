import { useRef, useState } from 'react';
import { progressActions } from '@/entities/progress';

const REVOKE_DELAY_MS = 1000;

export function ProgressBackup() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportFile = () => {
    const blob = new Blob([progressActions.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
    setMessage('Файл с прогрессом сохранён');
  };

  const importFile = async (file: File) => {
    try {
      progressActions.importJson(await file.text());
      setMessage('Прогресс восстановлен');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось прочитать файл');
    }
  };

  const reset = () => {
    if (window.confirm('Сбросить весь прогресс: отметки, тесты, дневник? Действие нельзя отменить.')) {
      progressActions.resetAll();
      setMessage('Прогресс сброшен');
    }
  };

  return (
    <div className="backup">
      <div className="actions">
        <button className="btn" onClick={exportFile}>⬇ Экспорт прогресса</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>⬆ Импорт</button>
        <button className="btn btn--danger" onClick={reset}>Сбросить всё</button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importFile(file);
          e.target.value = '';
        }}
      />
      {message && <p className="muted" role="status">{message}</p>}
    </div>
  );
}
