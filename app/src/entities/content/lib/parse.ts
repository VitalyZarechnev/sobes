import { normalizeKey, stripMarkdown } from '@/shared/lib';
import type { ChecklistItem } from '../model/types';

const CHECKBOX_LINE = /^\s*[-*]\s+\[[ xX]\]\s+(.+)$/;
const CODE_FENCE = /^\s*```/;

export const checklistKey = (pageId: string, text: string): string => `${pageId}::${normalizeKey(text)}`;

export const parseChecklist = (pageId: string, raw: string): ChecklistItem[] => {
  const items: ChecklistItem[] = [];
  const seen = new Set<string>();
  let inCode = false;
  for (const line of raw.split('\n')) {
    if (CODE_FENCE.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const match = CHECKBOX_LINE.exec(line);
    if (!match?.[1]) continue;
    const key = checklistKey(pageId, match[1]);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ key, text: stripMarkdown(match[1]) });
  }
  return items;
};

export const parseTitle = (raw: string, fallback: string): string => {
  const heading = raw.split('\n').find((line) => /^#\s+/.test(line));
  return heading ? stripMarkdown(heading.replace(/^#\s+/, '')) : fallback;
};

export const parseLinkedFiles = (raw: string): string[] => {
  const files: string[] = [];
  for (const match of raw.matchAll(/\]\(([^)#\s]+\.md)(?:#[^)]*)?\)/g)) {
    const file = match[1];
    if (file && !file.includes('/') && !files.includes(file)) files.push(file);
  }
  return files;
};
