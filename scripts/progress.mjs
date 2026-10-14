#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const README = join(ROOT, 'README.md');
const START = '<!-- PROGRESS:START -->';
const END = '<!-- PROGRESS:END -->';
const BAR_WIDTH = 20;
const DRY_RUN = process.argv.includes('--dry');

const SECTIONS = [
  { dir: '01-javascript', title: 'JavaScript' },
  { dir: '02-typescript', title: 'TypeScript' },
  { dir: '03-react', title: 'React и Next.js' },
  { dir: '04-vue', title: 'Vue и Nuxt' },
  { dir: '05-architecture', title: 'Архитектура' },
  { dir: '06-web-platform', title: 'Вёрстка, браузер, сеть' },
  { dir: '07-lead', title: 'Lead-компетенции' },
  { dir: '08-ai', title: 'AI и агенты' },
  { dir: '10-tooling-testing', title: 'Сборка, тесты, DevOps' },
  { dir: '11-graphics', title: 'Canvas, 2D/3D графика' },
  { dir: '13-algorithms', title: 'Алгоритмы и структуры данных' },
  { dir: '14-design-systems', title: 'Дизайн-системы и UI-kit' },
  { dir: '15-production', title: 'Продакшн-фронтенд' },
  { dir: '16-forms-i18n-auth', title: 'Формы, i18n, auth' },
  { dir: '17-debugging-git-team', title: 'Отладка, git, команда' },
  { dir: '09-final', title: 'Финальная подготовка' },
  { file: 'ROADMAP.md', title: 'Роадмап (дни)' },
];

const CHECKBOX = /^\s*[-*]\s+\[( |x|X)\]/gm;

const countInText = (text) => {
  const marks = [...text.matchAll(CHECKBOX)].map((m) => m[1]);
  return { total: marks.length, done: marks.filter((m) => m !== ' ').length };
};

const listMarkdown = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listMarkdown(path);
    return name.endsWith('.md') ? [path] : [];
  });

const sum = (counts) =>
  counts.reduce((acc, c) => ({ total: acc.total + c.total, done: acc.done + c.done }), { total: 0, done: 0 });

const countSection = (section) => {
  try {
    const files = section.file ? [join(ROOT, section.file)] : listMarkdown(join(ROOT, section.dir));
    return sum(files.map((f) => countInText(readFileSync(f, 'utf8'))));
  } catch (error) {
    console.warn(`⚠️  Не удалось прочитать «${section.title}»: ${error.message}`);
    return { total: 0, done: 0 };
  }
};

const percent = ({ done, total }) => (total === 0 ? 0 : Math.round((done / total) * 100));

const bar = (pct) => {
  const filled = Math.round((pct / 100) * BAR_WIDTH);
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
};

const status = (pct) => (pct === 100 ? '✅' : pct >= 50 ? '🟡' : pct > 0 ? '🟠' : '⬜');

const rows = SECTIONS.map((s) => ({ ...s, ...countSection(s) }));
const overall = sum(rows.filter((r) => !r.file));

const table = [
  '| | Раздел | Прогресс | % | Пункты |',
  '|---|---|---|---|---|',
  ...rows.map((r) => {
    const pct = percent(r);
    const link = r.file ?? `${r.dir}/README.md`;
    return `| ${status(pct)} | [${r.title}](${link}) | \`${bar(pct)}\` | ${pct}% | ${r.done}/${r.total} |`;
  }),
  '',
  `**Всего по темам: ${percent(overall)}%** (${overall.done}/${overall.total}) · обновлено ${new Date().toISOString().slice(0, 10)}`,
].join('\n');

console.log(rows.map((r) => `${bar(percent(r))} ${String(percent(r)).padStart(3)}%  ${r.title}`).join('\n'));
console.log(`\nИтого: ${percent(overall)}% (${overall.done}/${overall.total})`);

if (!DRY_RUN) {
  const readme = readFileSync(README, 'utf8');
  const startIdx = readme.indexOf(START);
  const endIdx = readme.indexOf(END);
  if (startIdx === -1 || endIdx === -1) {
    console.error(`Не найдены маркеры ${START} / ${END} в ${relative(ROOT, README)}`);
    process.exit(1);
  }
  const updated = `${readme.slice(0, startIdx + START.length)}\n${table}\n${readme.slice(endIdx)}`;
  writeFileSync(README, updated);
  console.log(`\nДашборд в ${relative(ROOT, README)} обновлён.`);
}
