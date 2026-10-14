#!/usr/bin/env node
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const QUIZ_DIR = join(ROOT, 'quizzes');
const DATA_DIR = join(QUIZ_DIR, 'data');
const RUN_TESTS = !process.argv.includes('--no-run');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length) ?? null;
const TEST_TIMEOUT_MS = 3000;

const SECTIONS = [
  { id: '01-javascript', title: 'JavaScript' },
  { id: '02-typescript', title: 'TypeScript' },
  { id: '03-react', title: 'React и Next.js' },
  { id: '04-vue', title: 'Vue и Nuxt' },
  { id: '05-architecture', title: 'Архитектура' },
  { id: '06-web-platform', title: 'Вёрстка, браузер, сеть' },
  { id: '07-lead', title: 'Lead-компетенции' },
  { id: '08-ai', title: 'AI и агенты' },
  { id: '10-tooling-testing', title: 'Сборка, тестирование, DevOps' },
  { id: '11-graphics', title: 'Canvas, 2D и 3D графика' },
  { id: '13-algorithms', title: 'Алгоритмы и структуры данных' },
  { id: '14-design-systems', title: 'Дизайн-системы и UI-kit' },
  { id: '15-production', title: 'Продакшн-фронтенд' },
  { id: '16-forms-i18n-auth', title: 'Формы, i18n, auth' },
  { id: '17-debugging-git-team', title: 'Отладка, git, командная работа' },
];

const TYPES = new Set(['single', 'multi', 'output', 'order', 'open']);
const LEVELS = new Set(['middle', 'senior', 'lead']);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return name.endsWith('.js') && !name.startsWith('_') ? [path] : [];
  });

const validateQuestion = (q, where) => {
  const errors = [];
  const fail = (msg) => errors.push(`${where}: ${msg}`);
  if (!TYPES.has(q.type)) fail(`неизвестный type "${q.type}"`);
  if (!LEVELS.has(q.level)) fail(`неизвестный level "${q.level}"`);
  if (!q.q) fail('нет текста вопроса q');
  if (['single', 'output', 'multi'].includes(q.type)) {
    if (!Array.isArray(q.options) || q.options.length < 2) fail('options должен быть массивом из 2+ вариантов');
    const answers = q.type === 'multi' ? q.answer : [q.answer];
    if (!Array.isArray(answers) || !answers.length) fail('answer пуст');
    else if (answers.some((a) => !Number.isInteger(a) || a < 0 || a >= (q.options?.length ?? 0)))
      fail(`answer вне диапазона: ${JSON.stringify(q.answer)}`);
    if (!q.explain) fail('нет explain');
  }
  if (q.type === 'order' && (!Array.isArray(q.items) || q.items.length < 2)) fail('items должен быть массивом из 2+ элементов');
  if (q.type === 'open' && !q.answer) fail('нет эталонного answer');
  return errors;
};

const validateTask = (t, where) => {
  const errors = [];
  const fail = (msg) => errors.push(`${where}: ${msg}`);
  if (!t.title) fail('нет title');
  if (!t.prompt) fail('нет prompt');
  if (!t.solution) fail('нет solution');
  if (!LEVELS.has(t.level)) fail(`неизвестный level "${t.level}"`);
  if (t.tests !== undefined) {
    if (!Array.isArray(t.tests)) fail('tests должен быть массивом');
    else t.tests.forEach((test, i) => (!test.name || !test.code) && fail(`tests[${i}] без name/code`));
  }
  return errors;
};

const ATTEMPTS = 3;

const runTest = async (task, test) => {
  const source = `(async () => {\n${task.solution}\n;return await (async () => {\n${test.code}\n})();\n})()`;
  const context = vm.createContext({
    console: { log() {}, warn() {}, error() {} },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    queueMicrotask,
    structuredClone,
    AbortController,
    AbortSignal,
    URL,
    TextEncoder,
    TextDecoder,
    performance,
  });
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('таймаут')), TEST_TIMEOUT_MS));
    const result = await Promise.race([vm.runInContext(source, context, { timeout: TEST_TIMEOUT_MS }), timeout]);
    return result === true ? null : `«${test.name}» вернул ${String(result)}`;
  } catch (err) {
    return `«${test.name}» упал: ${err?.message ?? err}`;
  }
};

const runSolution = async (task) => {
  const failures = [];
  for (const test of task.tests) {
    let failure = null;
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      failure = await runTest(task, test);
      if (!failure) break;
    }
    if (failure) failures.push(failure);
  }
  return failures;
};

const files = (existsSync(DATA_DIR) ? walk(DATA_DIR) : []).filter(
  (f) => !ONLY || relative(DATA_DIR, f).replace(/\\/g, '/').startsWith(ONLY),
);
const quizzes = [];
const errors = [];
const warnings = [];

for (const file of files) {
  const rel = relative(DATA_DIR, file).replace(/\\/g, '/');
  const expectedId = rel.replace(/\.js$/, '');
  const registered = [];
  try {
    vm.runInNewContext(readFileSync(file, 'utf8'), { QUIZ: { register: (q) => registered.push(q) } }, { filename: file });
  } catch (err) {
    errors.push(`${rel}: синтаксическая ошибка — ${err.message}`);
    continue;
  }
  if (registered.length !== 1) {
    errors.push(`${rel}: ожидался ровно один QUIZ.register, найдено ${registered.length}`);
    continue;
  }
  const quiz = registered[0];
  if (quiz.id !== expectedId) errors.push(`${rel}: id "${quiz.id}" не совпадает с путём "${expectedId}"`);
  if (!SECTIONS.some((s) => s.id === quiz.section)) errors.push(`${rel}: неизвестный section "${quiz.section}"`);
  if (!quiz.title) errors.push(`${rel}: нет title`);
  if (quiz.source && !existsSync(resolve(QUIZ_DIR, quiz.source))) warnings.push(`${rel}: source не найден — ${quiz.source}`);
  const questions = quiz.questions ?? [];
  const tasks = quiz.tasks ?? [];
  questions.forEach((q, i) => errors.push(...validateQuestion(q, `${rel} q[${i}]`)));
  tasks.forEach((t, i) => errors.push(...validateTask(t, `${rel} task[${i}]`)));

  if (RUN_TESTS) {
    for (const [i, task] of tasks.entries()) {
      if (!Array.isArray(task.tests) || !task.tests.length || (task.lang ?? 'js') !== 'js' || task.env === 'browser') continue;
      const failures = await runSolution(task);
      failures.forEach((f) => errors.push(`${rel} task[${i}] эталон не проходит тест ${f}`));
    }
  }

  const levels = {};
  questions.forEach((q) => (levels[q.level] = (levels[q.level] ?? 0) + 1));
  quizzes.push({
    id: quiz.id,
    section: quiz.section,
    title: quiz.title,
    order: quiz.order ?? 99,
    questionCount: questions.length,
    taskCount: tasks.length,
    levels,
  });
}

const sectionOrder = Object.fromEntries(SECTIONS.map((s, i) => [s.id, i]));
const sorted = [...quizzes].sort(
  (a, b) => sectionOrder[a.section] - sectionOrder[b.section] || a.order - b.order || a.id.localeCompare(b.id),
);

const totalQ = sorted.reduce((s, q) => s + q.questionCount, 0);
const totalT = sorted.reduce((s, q) => s + q.taskCount, 0);
console.log(`Тестов: ${sorted.length}, вопросов: ${totalQ}, задач: ${totalT}`);
warnings.forEach((w) => console.warn(`⚠️  ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`❌ ${e}`));
  console.error(`\nОшибок: ${errors.length}`);
  process.exit(1);
}
console.log('✅ Тесты валидны, эталонные решения проходят автотесты.');
