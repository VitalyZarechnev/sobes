import { useEffect, useState } from 'react';
import { readString, writeString } from '@/shared/lib';

type Theme = 'light' | 'dark' | 'system';
const KEY = 'fe-interview-wiki:theme';
const NEXT: Readonly<Record<Theme, Theme>> = { system: 'light', light: 'dark', dark: 'system' };
const LABEL: Readonly<Record<Theme, string>> = { system: '◐ Авто', light: '☀️ Светлая', dark: '🌙 Тёмная' };

const isTheme = (value: string | null): value is Theme => value !== null && Object.hasOwn(NEXT, value);

const apply = (theme: Theme) => {
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = readString(KEY);
    return isTheme(stored) ? stored : 'system';
  });
  useEffect(() => {
    apply(theme);
    writeString(KEY, theme);
  }, [theme]);
  return (
    <button className="btn btn--ghost" onClick={() => setTheme((t) => NEXT[t])} aria-label="Сменить тему">
      {LABEL[theme]}
    </button>
  );
}
