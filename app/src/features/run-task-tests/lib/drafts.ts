import { isLegacyIndexKey, QUIZZES } from '@/entities/quiz';
import { listKeys, readString, removeKey, writeString } from '@/shared/lib';

const DRAFT_PREFIX = 'fe-interview-wiki:draft:';

export const draftKey = (scope: string, taskId: string): string => `${scope}:${taskId}`;

const storageKey = (key: string): string => `${DRAFT_PREFIX}${key}`;

const legacyDraftTargets = (): Map<string, string> => {
  const targets = new Map<string, string>();
  for (const quiz of QUIZZES.values()) {
    quiz.tasks.forEach((task, index) => targets.set(storageKey(draftKey(quiz.id, String(index))), storageKey(draftKey(quiz.id, task.id))));
  }
  return targets;
};

let migrated = false;

const migrateLegacyDrafts = (): void => {
  if (migrated) return;
  migrated = true;
  const legacy = listKeys().filter((key) => key.startsWith(DRAFT_PREFIX) && isLegacyIndexKey(key.split(':').at(-1) ?? ''));
  if (legacy.length === 0) return;
  const targets = legacyDraftTargets();
  for (const key of legacy) {
    const target = targets.get(key);
    const value = readString(key);
    if (target && value !== null && readString(target) === null && !writeString(target, value)) continue;
    removeKey(key);
  }
};

export const readDraft = (key: string): string | null => {
  migrateLegacyDrafts();
  return readString(storageKey(key));
};

export const writeDraft = (key: string, value: string): boolean => writeString(storageKey(key), value);
