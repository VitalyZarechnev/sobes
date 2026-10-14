import { LEVEL_LABEL, type Level } from '../model/types';

export function LevelBadge({ level }: { readonly level: Level }) {
  return <span className={`level level--${level}`}>{LEVEL_LABEL[level]}</span>;
}
