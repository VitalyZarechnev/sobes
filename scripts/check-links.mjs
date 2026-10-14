#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP = new Set(['node_modules', 'app', '.git', '.claude', 'scripts']);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const files = walk(ROOT).filter((f) => f.endsWith('.md') || (f.includes('/quizzes/data/') && f.endsWith('.js')));
const broken = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const base = file.includes('/quizzes/data/') ? join(ROOT, 'quizzes') : dirname(file);
  for (const [, href] of text.matchAll(/\]\(([^)\s]+?\.md)(?:#[^)]*)?\)/g)) {
    if (/^https?:/.test(href)) continue;
    if (!existsSync(join(base, decodeURI(href)))) broken.push(`${relative(ROOT, file)} → ${href}`);
  }
  for (const [, id] of text.matchAll(/quiz\.html\?id=([\w./-]+)/g)) {
    if (!existsSync(join(ROOT, 'quizzes', 'data', `${id}.js`))) broken.push(`${relative(ROOT, file)} → тест ${id}`);
  }
}
console.log(broken.length ? broken.join('\n') : 'Битых ссылок нет');
console.log(`\nВсего битых: ${broken.length}`);
if (broken.length > 0) process.exit(1);
