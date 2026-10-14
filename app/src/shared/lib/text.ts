export const stripMarkdown = (text: string): string =>
  text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim();

export const normalizeKey = (text: string): string =>
  stripMarkdown(text)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

export const withHardBreaks = (text: string): string =>
  text
    .split(/(```[\s\S]*?```)/g)
    .map((part) => (part.startsWith('```') ? part : part.replace(/(?<!\n)\n(?!\n)/g, '  \n')))
    .join('');

export const pluralRu = (n: number, forms: readonly [string, string, string]): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
};

export const percent = (done: number, total: number): number => (total === 0 ? 0 : Math.round((done / total) * 100));

export const shuffle = <T,>(items: readonly T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
};
