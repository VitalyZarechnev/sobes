#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DATA_DIR = join(ROOT, 'quizzes', 'data');

const loadAll = (file) => {
  const registered = [];
  vm.runInNewContext(readFileSync(file, 'utf8'), { QUIZ: { register: (q) => registered.push(q) } }, { filename: file });
  if (registered.length === 0) throw new Error(`${file}: не найден QUIZ.register`);
  return registered;
};

const load = (file) => {
  const registered = loadAll(file);
  if (registered.length !== 1) throw new Error(`${file}: ожидался один QUIZ.register`);
  return registered[0];
};

const [, , patchFile] = process.argv;
if (!patchFile) {
  console.error('Использование: node scripts/quiz-append.mjs <файл-добавка.js>');
  process.exit(1);
}

for (const patch of loadAll(patchFile)) {
  const target = join(DATA_DIR, `${patch.id}.js`);
  const base = existsSync(target)
    ? load(target)
    : { id: patch.id, section: patch.section, title: patch.title, order: patch.order, source: patch.source, questions: [], tasks: [] };

  const knownQ = new Set(base.questions.map((q) => q.q + (q.code ?? '')));
  const knownT = new Set((base.tasks ?? []).map((t) => t.title));
  const newQ = (patch.questions ?? []).filter((q) => !knownQ.has(q.q + (q.code ?? '')));
  const newT = (patch.tasks ?? []).filter((t) => !knownT.has(t.title));

  const merged = {
    ...base,
      questions: [...base.questions, ...newQ],
    tasks: [...(base.tasks ?? []), ...newT],
  };

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `QUIZ.register(${JSON.stringify(merged, null, 2)});\n`);
  console.log(`${patch.id}: +${newQ.length} вопросов, +${newT.length} задач (всего ${merged.questions.length} / ${merged.tasks.length})`);
}
