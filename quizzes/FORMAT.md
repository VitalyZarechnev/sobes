# Формат тестов (для авторов)

Один файл = одна тема вики: `quizzes/data/<раздел>/<имя-md-файла-без-.md>.js`.
Например, для `01-javascript/05-event-loop-async.md` → `quizzes/data/01-javascript/05-event-loop-async.js`.
После изменений: `node scripts/build-quizzes.mjs`. Скрипт валидирует схему и **прогоняет эталонные решения
JS-задач через их тесты в Node** — сборка должна пройти без ❌.

```js
QUIZ.register({
  id: '01-javascript/05-event-loop-async',   // = путь файла без .js
  section: '01-javascript',                  // id раздела (см. SECTIONS в scripts/build-quizzes.mjs)
  title: 'Event Loop и асинхронность',
  order: 5,                                   // порядок внутри раздела
  source: '../01-javascript/05-event-loop-async.md', // путь к теории ОТНОСИТЕЛЬНО папки quizzes/
  questions: [
    // single — один правильный вариант; answer — индекс
    { type: 'single', level: 'middle', q: 'Чем отличается `let` от `var`?',
      options: ['...', '...', '...', '...'], answer: 2, explain: 'Почему так (1–4 предложения).' },

    // output — «что выведет»: код в поле code; варианты — строки вывода
    { type: 'output', level: 'senior', q: 'Что выведет код?',
      code: "console.log(1);\nsetTimeout(() => console.log(2));\nPromise.resolve().then(() => console.log(3));",
      options: ['1 2 3', '1 3 2', '3 1 2', '2 1 3'], answer: 1, explain: '...' },

    // multi — несколько правильных; answer — массив индексов
    { type: 'multi', level: 'senior', q: 'Что из этого — микрозадачи?',
      options: ['Promise.then', 'setTimeout', 'queueMicrotask', 'MutationObserver'], answer: [0, 2, 3], explain: '...' },

    // order — items перечисляются В ПРАВИЛЬНОМ порядке, движок сам перемешает
    { type: 'order', level: 'senior', q: 'Расположите этапы рендеринга по порядку',
      items: ['Parse HTML → DOM', 'Style', 'Layout', 'Paint', 'Composite'], explain: '...' },

    // open — вопрос «ответь вслух», самооценка; answer — эталонный ответ (мини-markdown)
    { type: 'open', level: 'lead', q: 'Как бы вы объяснили...?', answer: 'Эталон...' },
  ],
  tasks: [
    {
      title: 'Реализуйте promiseAll',
      level: 'senior',
      prompt: 'Описание задачи. Поддерживается `код`, **жирный**, ```блоки```.',
      starter: 'function promiseAll(promises) {\n  // ваш код\n}',
      solution: 'function promiseAll(promises) { /* эталон */ }',
      notes: 'Разбор: сложность, edge cases.',
      // Автотесты (только для lang: 'js'): каждый code — тело async-функции, ДОЛЖНО вернуть true.
      // Код пользователя/эталона выполняется перед тестом в той же области видимости.
      tests: [
        { name: 'порядок результатов', code: "const r = await promiseAll([Promise.resolve(1), 2]);\nreturn JSON.stringify(r) === '[1,2]';" },
        { name: 'reject первой ошибкой', code: "try { await promiseAll([Promise.reject(new Error('x'))]); return false; } catch (e) { return e.message === 'x'; }" },
      ],
      // lang: 'ts' | 'vue' | 'tsx' | 'css' | 'html' — тогда тестов нет, только эталон для самопроверки.
      // env: 'browser' — тесты используют DOM: в браузере запускаются, в Node при сборке пропускаются.
    },
  ],
});
```

## Правила

- **Уровни**: `middle` (база, которую спрашивают у всех), `senior` (глубина, нюансы), `lead` (решения, trade-offs, процессы).
  В технических темах примерно 30% middle / 50% senior / 20% lead; в lead-темах в основном lead.
- **Количество на тему**: 10–15 вопросов, минимум 3 типа (обязательно `output` там, где есть код), и 2–4 задачи.
- **Неправильные варианты** должны быть правдоподобными: типичные заблуждения, а не очевидная чепуха.
  Правильный вариант не должен выделяться длиной.
- **explain** обязателен: объясни, почему верный ответ верен, и почему популярный неверный — неверен.
- Только мини-markdown: `` `код` ``, `**жирный**`, ```` ```блоки``` ````, `[ссылки](url)`, переносы `\n`. HTML не писать.
- Строки JS: аккуратно с кавычками и обратными слэшами; для многострочного кода используй `\n` или шаблонные строки
  (но тогда экранируй `${` и обратные кавычки внутри).
- **Тесты задач** должны быть детерминированными и быстрыми (< 1 с), без сети. Таймеры — короткие (≤ 50 мс).
- В Node при сборке доступны: setTimeout/Interval, queueMicrotask, structuredClone, AbortController, URL, TextEncoder.
  Если нужен DOM — ставь `env: 'browser'`.
- **Идентичность вопросов и задач.** Прогресс хранится не по номеру, а по id: для вопроса он вычисляется из
  `type + q + code`, для задачи — из `title`. Поэтому вопросы можно вставлять и переставлять свободно, а правка
  текста вопроса сбрасывает только его собственный ответ. Если нужно поправить текст, сохранив ответы, или два
  вопроса совпадают по содержимому, задай явный `id: 'closure-counter'` (буквы, цифры, `_`, `-`, не число).
  Сборка падает, если внутри теста два вопроса или две задачи получают одинаковый id.
- **Задачи на алгоритмы** (`section: '13-algorithms'`) попадают в каталог `#/algo`, поэтому у каждой обязательны
  `difficulty: 'easy' | 'medium' | 'hard'` и непустой `tags: ['hash-map', 'two-pointers']`. Без них сборка падает.
