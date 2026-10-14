import { percent } from '@/shared/lib';

interface ProgressBarProps {
  readonly done: number;
  readonly total: number;
  readonly size?: 'sm' | 'md';
  readonly label?: string;
}

export function ProgressBar({ done, total, size = 'md', label }: ProgressBarProps) {
  const value = percent(done, total);
  return (
    <div
      className={`progress progress--${size} ${value === 100 ? 'progress--done' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label ?? `Прогресс ${value}%`}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
