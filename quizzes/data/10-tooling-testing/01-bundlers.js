QUIZ.register({
  "id": "10-tooling-testing/01-bundlers",
  "section": "10-tooling-testing",
  "title": "Сборщики",
  "order": 1,
  "source": "../10-tooling-testing/01-bundlers.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Почему dev-сервер Vite стартует быстро на большом проекте?",
      "options": [
        "Он собирает бандл на Rust",
        "Отдаёт исходники как нативные ESM и трансформирует их по запросу",
        "Кэширует бандл между запусками",
        "Не поддерживает TypeScript"
      ],
      "answer": 1,
      "explain": "Работа пропорциональна открытой странице, а не всему проекту."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает pre-bundling зависимостей в Vite?",
      "options": [
        "Проверяет типы пакетов",
        "Собирает зависимости из node_modules в ESM-модули (CJS → ESM, множество файлов → один)",
        "Минифицирует ваш код",
        "Скачивает пакеты"
      ],
      "answer": 1,
      "explain": "Иначе браузер делал бы сотни запросов к модулям одной библиотеки, а CommonJS не работал бы вовсе."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какой сборщик используется в Vite 8 для prod-сборки?",
      "options": [
        "Rollup",
        "esbuild",
        "Rolldown",
        "webpack"
      ],
      "answer": 2,
      "explain": "Rolldown — Rust-сборщик с Rollup-совместимым API."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "esbuild/SWC/Oxc при сборке TypeScript…",
      "options": [
        "проверяют типы",
        "только удаляют аннотации типов, проверку не делают",
        "генерируют .d.ts всегда",
        "запускают tsc"
      ],
      "answer": 1,
      "explain": "Проверка — отдельно: `tsc --noEmit` / `vue-tsc`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Пользователь с открытой вкладкой после деплоя получает «Failed to fetch dynamically imported module». Причина?",
      "options": [
        "Ошибка в коде нового релиза",
        "Старый index.html ссылается на чанки, удалённые при деплое",
        "CORS",
        "Нет sourcemaps"
      ],
      "answer": 1,
      "explain": "Храните старые ассеты какое-то время и обрабатывайте ошибку загрузки чанка перезагрузкой."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Большой проект на webpack, сборка 6 минут. Наименее рискованный путь ускорения?",
      "options": [
        "Переписать на Vite за спринт",
        "Миграция на Rspack (совместим с конфигом и большинством плагинов)",
        "Отключить минификацию",
        "Убрать TypeScript"
      ],
      "answer": 1,
      "explain": "Rspack задуман как совместимая замена webpack."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что мешает tree shaking?",
      "options": [
        "CommonJS-модули",
        "побочные эффекты верхнего уровня без `sideEffects: false`",
        "динамический доступ `ns[name]` к `import * as ns`",
        "именованные ESM-экспорты",
        "минификация"
      ],
      "answer": [
        0,
        1,
        2
      ],
      "explain": "Именованные ESM-экспорты — как раз то, что позволяет tree shaking."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какие заголовки кэширования подходят для `assets/index-3f9a1c.js`?",
      "options": [
        "`no-store`",
        "`no-cache`",
        "`public, max-age=31536000, immutable`",
        "`max-age=60`"
      ],
      "answer": 2,
      "explain": "Имя содержит хэш содержимого — файл никогда не изменится. А `index.html` — `no-cache`."
    }
  ],
  "tasks": [
    {
      "title": "Мини-бандлер: порядок выполнения модулей",
      "level": "senior",
      "prompt": "Дан граф модулей `{ [name]: string[] }` (импорты по порядку) и точка входа. Верните порядок **выполнения** модулей так, как это делает ESM: зависимости выполняются раньше импортёра (post-order DFS), каждый модуль — один раз; при цикле модуль, уже находящийся в процессе обхода, пропускается.\n\n`{ main: [\"a\", \"b\"], a: [\"c\"], b: [\"c\"], c: [] }`, `main` → `[\"c\", \"a\", \"b\", \"main\"]`",
      "starter": "function executionOrder(graph, entry) {\n  // ваш код\n}",
      "solution": "function executionOrder(graph, entry) {\n  const order = [];\n  const visited = new Set();\n  const visit = (name) => {\n    if (visited.has(name)) return; // уже выполнен или в процессе (цикл)\n    visited.add(name);\n    for (const dep of graph[name] ?? []) visit(dep);\n    order.push(name);\n  };\n  visit(entry);\n  return order;\n}",
      "tests": [
        {
          "name": "ромб",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(executionOrder({ main: [\"a\", \"b\"], a: [\"c\"], b: [\"c\"], c: [] }, \"main\"), [\"c\", \"a\", \"b\", \"main\"]);"
        },
        {
          "name": "цикл",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(executionOrder({ a: [\"b\"], b: [\"a\"] }, \"a\"), [\"b\", \"a\"]);"
        },
        {
          "name": "недостижимые не входят",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(executionOrder({ main: [], x: [] }, \"main\"), [\"main\"]);"
        }
      ],
      "notes": "Из-за этого порядка в циклических импортах модуль `b` выполняется раньше `a` и при обращении к ещё не инициализированным `let`/`const`-экспортам `a` получает ReferenceError (TDZ)."
    },
    {
      "title": "Content hash для имени файла",
      "level": "middle",
      "prompt": "Реализуйте `hashedName(fileName, content)`: вставляет перед расширением 8 hex-символов хэша содержимого (FNV-1a 32-bit по кодам UTF-16 символов строки). `hashedName(\"index.js\", \"a\")` → `\"index.e40c292c.js\"`. Файл без расширения — хэш в конце через точку.",
      "starter": "function hashedName(fileName, content) {\n  // ваш код\n}",
      "solution": "function hashedName(fileName, content) {\n  let hash = 0x811c9dc5;\n  for (let i = 0; i < content.length; i++) {\n    hash ^= content.charCodeAt(i);\n    hash = Math.imul(hash, 0x01000193) >>> 0;\n  }\n  const hex = hash.toString(16).padStart(8, '0');\n  const dot = fileName.lastIndexOf('.');\n  return dot <= 0 ? `${fileName}.${hex}` : `${fileName.slice(0, dot)}.${hex}${fileName.slice(dot)}`;\n}",
      "tests": [
        {
          "name": "пример",
          "code": "return hashedName(\"index.js\", \"a\") === \"index.e40c292c.js\";"
        },
        {
          "name": "стабильность",
          "code": "return hashedName(\"x.css\", \"body{}\") === hashedName(\"x.css\", \"body{}\");"
        },
        {
          "name": "содержимое меняет хэш",
          "code": "return hashedName(\"x.js\", \"1\") !== hashedName(\"x.js\", \"2\");"
        },
        {
          "name": "без расширения",
          "code": "return /^LICENSE\\.[0-9a-f]{8}$/.test(hashedName(\"LICENSE\", \"MIT\"));"
        },
        {
          "name": "padding нулями",
          "code": "return /^a\\.[0-9a-f]{8}\\.js$/.test(hashedName(\"a.js\", \"\"));"
        }
      ],
      "notes": "`Math.imul` и `>>> 0` нужны, чтобы получить корректное 32-битное беззнаковое умножение в JS. Реальные сборщики используют xxhash или sha256."
    }
  ]
});
