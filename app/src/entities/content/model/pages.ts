import { markdownFiles } from '@/shared/content/raw';
import { parseChecklist, parseLinkedFiles, parseTitle } from '../lib/parse';
import { SECTIONS } from './sections';
import type { Page } from './types';

const buildPages = (): Map<string, Page> => {
  const pages = new Map<string, Page>();
  for (const [file, raw] of markdownFiles) {
    const id = file.replace(/\.md$/, '');
    const [first, ...rest] = id.split('/');
    const sectionId = rest.length > 0 && first && SECTIONS.some((s) => s.id === first) ? first : null;
    if (rest.length > 0 && !sectionId) continue;
    pages.set(id, {
      id,
      sectionId,
      isSectionIndex: rest.length === 1 && rest[0] === 'README',
      title: parseTitle(raw, id),
      raw,
      checklist: parseChecklist(id, raw),
    });
  }
  return pages;
};

export const PAGES: ReadonlyMap<string, Page> = buildPages();

const orderSectionTopics = (sectionId: string): Page[] => {
  const all = [...PAGES.values()].filter((p) => p.sectionId === sectionId && !p.isSectionIndex);
  const readme = PAGES.get(`${sectionId}/README`);
  const order = readme ? parseLinkedFiles(readme.raw) : [];
  const rank = (p: Page): number => {
    const index = order.indexOf(`${p.id.split('/').pop()}.md`);
    return index === -1 ? order.length : index;
  };
  return all.toSorted((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
};

export const SECTION_TOPICS: ReadonlyMap<string, readonly Page[]> = new Map(
  SECTIONS.map((s) => [s.id, orderSectionTopics(s.id)]),
);

export const AVAILABLE_SECTIONS = SECTIONS.filter((s) => PAGES.has(`${s.id}/README`));

export const getPage = (id: string): Page | undefined => PAGES.get(id);

export const sectionPages = (sectionId: string): Page[] => [
  ...(PAGES.has(`${sectionId}/README`) ? [PAGES.get(`${sectionId}/README`) as Page] : []),
  ...(SECTION_TOPICS.get(sectionId) ?? []),
];

export const adjacentTopics = (page: Page): { prev: Page | null; next: Page | null } => {
  if (!page.sectionId || page.isSectionIndex) return { prev: null, next: null };
  const topics = SECTION_TOPICS.get(page.sectionId) ?? [];
  const index = topics.findIndex((t) => t.id === page.id);
  return { prev: topics[index - 1] ?? null, next: topics[index + 1] ?? null };
};
