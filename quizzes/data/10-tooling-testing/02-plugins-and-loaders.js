QUIZ.register({
  "id": "10-tooling-testing/02-plugins-and-loaders",
  "section": "10-tooling-testing",
  "title": "Плагины и лоадеры",
  "order": 2,
  "source": "../10-tooling-testing/02-plugins-and-loaders.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "Какой хук Rollup/Vite нужен, чтобы отдать код виртуального модуля?",
      "options": [
        "`transform`",
        "`load`",
        "`generateBundle`",
        "`configResolved`"
      ],
      "answer": 1,
      "explain": "`resolveId` возвращает id, `load` — код для этого id."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем id виртуального модуля начинают с `\\0`?",
      "options": [
        "Для скорости",
        "Соглашение: другие плагины не обрабатывают такие id",
        "Требование браузера",
        "Чтобы скрыть модуль из бандла"
      ],
      "answer": 1,
      "explain": "Например, node-резолвер и трансформеры файлов пропустят его."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем лоадер webpack отличается от плагина?",
      "options": [
        "Ничем",
        "Лоадер трансформирует отдельный файл, плагин подписывается на хуки всей компиляции",
        "Плагин работает только в dev",
        "Лоадер пишется на Rust"
      ],
      "answer": 1,
      "explain": "Лоадеры — цепочка преобразований файла, плагины — расширение компилятора."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что вернуть из `transform`, чтобы не сломать отладку?",
      "options": [
        "Только `code`",
        "`{ code, map }` со sourcemap",
        "Ничего",
        "Строку с комментарием"
      ],
      "answer": 1,
      "explain": "Без карты все последующие sourcemaps будут указывать не туда. Помогает magic-string."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Как ускорить плагин с `transform`?",
      "options": [
        "Ранний выход по id (фильтр по расширению, исключение node_modules)",
        "Быстрая проверка `code.includes(...)` до разбора",
        "Кэширование дорогих вычислений",
        "Чтение всего проекта в каждом вызове",
        "Декларативный filter хука в Rolldown/Vite"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Transform вызывается для каждого модуля, лишняя работа умножается на тысячи файлов."
    }
  ],
  "tasks": [
    {
      "title": "Плагин виртуального модуля",
      "level": "senior",
      "prompt": "Напишите фабрику `virtualModules(modules)`, где `modules` — объект `{ \"virtual:name\": \"код\" }`. Плагин должен иметь `name`, `resolveId(id)` (для известных id возвращает `\"\\0\" + id`, иначе `null`) и `load(id)` (для резолвнутых id возвращает код, иначе `null`).",
      "starter": "function virtualModules(modules) {\n  // ваш код\n}",
      "solution": "function virtualModules(modules) {\n  const PREFIX = '\\0';\n  return {\n    name: 'virtual-modules',\n    resolveId(id) {\n      return Object.hasOwn(modules, id) ? PREFIX + id : null;\n    },\n    load(id) {\n      if (!id.startsWith(PREFIX)) return null;\n      const publicId = id.slice(PREFIX.length);\n      return Object.hasOwn(modules, publicId) ? modules[publicId] : null;\n    },\n  };\n}",
      "tests": [
        {
          "name": "resolve + load",
          "code": "const p = virtualModules({ \"virtual:env\": \"export const mode = 'prod';\" }); const id = p.resolveId(\"virtual:env\"); return id === \"\\0virtual:env\" && p.load(id) === \"export const mode = 'prod';\";"
        },
        {
          "name": "чужие id",
          "code": "const p = virtualModules({ \"virtual:a\": \"\" }); return p.resolveId(\"./a.js\") === null && p.load(\"/src/a.js\") === null;"
        },
        {
          "name": "name",
          "code": "return typeof virtualModules({}).name === \"string\";"
        },
        {
          "name": "не путается с прототипом",
          "code": "const p = virtualModules({}); return p.resolveId(\"constructor\") === null;"
        }
      ]
    },
    {
      "title": "Transform-плагин: замена define-констант",
      "level": "senior",
      "prompt": "Напишите `definePlugin(defines)`: плагин с `transform(code, id)`, который в файлах `.js/.ts/.jsx/.tsx` (кроме `node_modules`) заменяет вхождения ключей `defines` (например, `__APP_VERSION__`) на `JSON.stringify(значение)`. Заменять только целые идентификаторы (не `MY__APP_VERSION__X`). Если замен нет или файл не подходит — вернуть `null`. Иначе — `{ code }`.",
      "starter": "function definePlugin(defines) {\n  // ваш код\n}",
      "solution": "function definePlugin(defines) {\n  const keys = Object.keys(defines);\n  const escape = (s) => s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');\n  const pattern = keys.length ? new RegExp(`(?<![\\\\w$])(${keys.map(escape).join('|')})(?![\\\\w$])`, 'g') : null;\n  return {\n    name: 'define',\n    transform(code, id) {\n      if (!pattern || !/\\.[jt]sx?$/.test(id) || id.includes('node_modules')) return null;\n      let changed = false;\n      const out = code.replace(pattern, (key) => {\n        changed = true;\n        return JSON.stringify(defines[key]);\n      });\n      return changed ? { code: out } : null;\n    },\n  };\n}",
      "tests": [
        {
          "name": "замена",
          "code": "const p = definePlugin({ __APP_VERSION__: \"1.2.3\" }); return p.transform(\"console.log(__APP_VERSION__)\", \"/src/a.ts\").code === 'console.log(\"1.2.3\")';"
        },
        {
          "name": "целые идентификаторы",
          "code": "const p = definePlugin({ __V__: 1 }); return p.transform(\"const x = MY__V__X + __V__;\", \"/a.js\").code === \"const x = MY__V__X + 1;\";"
        },
        {
          "name": "node_modules и css пропускаются",
          "code": "const p = definePlugin({ __V__: 1 }); return p.transform(\"__V__\", \"/node_modules/x/a.js\") === null && p.transform(\"__V__\", \"/a.css\") === null;"
        },
        {
          "name": "нет замен → null",
          "code": "return definePlugin({ __V__: 1 }).transform(\"const a = 1;\", \"/a.js\") === null;"
        },
        {
          "name": "объекты",
          "code": "const p = definePlugin({ __FLAGS__: { beta: true } }); return p.transform(\"f(__FLAGS__)\", \"/a.tsx\").code === 'f({\"beta\":true})';"
        }
      ],
      "notes": "Настоящий `define` в Vite/Rolldown работает по AST и не трогает строки и комментарии. Здесь — упрощение на регулярных выражениях с lookbehind."
    }
  ]
});
