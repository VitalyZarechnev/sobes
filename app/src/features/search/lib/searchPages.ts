import { PAGES, type Page } from '@/entities/content';
import { stripMarkdown } from '@/shared/lib';

export interface SearchHit {
  readonly page: Page;
  readonly score: number;
  readonly snippet: string;
}

const MAX_HITS = 40;

export const searchPages = (query: string): SearchHit[] => {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const page of PAGES.values()) {
    const text = page.raw.toLowerCase();
    if (!words.every((w) => text.includes(w))) continue;
    const title = page.title.toLowerCase();
    const score = words.reduce((s, w) => s + (title.includes(w) ? 10 : 0) + text.split(w).length - 1, 0);
    const first = text.indexOf(words[0] ?? '');
    const snippet = stripMarkdown(page.raw.slice(Math.max(0, first - 80), first + 160)).replace(/\s+/g, ' ');
    hits.push({ page, score, snippet });
  }
  return hits.toSorted((a, b) => b.score - a.score).slice(0, MAX_HITS);
};
