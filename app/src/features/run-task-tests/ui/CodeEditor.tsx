import type { KeyboardEvent } from 'react';

interface CodeEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
}

export function CodeEditor({ value, onChange, label }: CodeEditorProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab' || event.shiftKey) return;
    event.preventDefault();
    const el = event.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    const next = `${value.slice(0, start)}  ${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 2;
    });
  };
  return (
    <textarea
      className="editor"
      aria-label={label}
      spellCheck={false}
      value={value}
      rows={Math.min(24, Math.max(8, value.split('\n').length + 2))}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  );
}
