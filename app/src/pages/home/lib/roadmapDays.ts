import { CHECKBOX_LINE, checklistKey, getPage } from '@/entities/content';

export interface RoadmapDay {
  readonly title: string;
  readonly items: readonly { readonly key: string; readonly text: string }[];
}

export const parseRoadmapDays = (): RoadmapDay[] => {
  const page = getPage('ROADMAP');
  if (!page) return [];
  const days: { title: string; items: { key: string; text: string }[] }[] = [];
  for (const line of page.raw.split('\n')) {
    const heading = /^###\s+(День\s+\d+.*)$/.exec(line);
    if (heading?.[1]) {
      days.push({ title: heading[1], items: [] });
      continue;
    }
    const item = CHECKBOX_LINE.exec(line);
    const current = days.at(-1);
    if (item?.[1] && current) current.items.push({ key: checklistKey('ROADMAP', item[1]), text: item[1] });
  }
  return days;
};
