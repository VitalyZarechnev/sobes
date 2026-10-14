QUIZ.register({
  "id": "10-tooling-testing/03-bundle-optimization",
  "section": "10-tooling-testing",
  "title": "Оптимизация бандла",
  "order": 3,
  "source": "../10-tooling-testing/03-bundle-optimization.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Почему 300 KB JS «дороже» 300 KB картинки?",
      "options": [
        "JS хуже сжимается",
        "JS нужно распарсить, скомпилировать и выполнить в главном потоке",
        "Картинки кэшируются, а JS нет",
        "Не дороже"
      ],
      "answer": 1,
      "explain": "Картинка декодируется вне главного потока и не блокирует ввод."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что создаёт границу ленивого чанка?",
      "options": [
        "`import x from`",
        "динамический `import()`",
        "`require`",
        "`export *`"
      ],
      "answer": 1,
      "explain": "Сборщик выносит модуль и его зависимости в отдельный файл."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "`import { debounce } from \"lodash\"` добавил 70 KB. Почему?",
      "options": [
        "debounce большой",
        "пакет lodash — CommonJS, tree shaking не работает",
        "ошибка сборщика",
        "из-за TypeScript"
      ],
      "answer": 1,
      "explain": "Используйте `lodash-es`, `lodash/debounce` или нативную реализацию."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что нельзя делать с LCP-картинкой первого экрана?",
      "options": [
        "`fetchpriority=\"high\"`",
        "`loading=\"lazy\"`",
        "указывать `width` и `height`",
        "использовать AVIF"
      ],
      "answer": 1,
      "explain": "Ленивая загрузка откладывает её начало."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Чем закрепить результат оптимизации, чтобы бандл не разрастался снова?",
      "options": [
        "size-limit/bundlesize в CI",
        "Lighthouse CI с порогами",
        "RUM-дашборд с алертами",
        "Отключить code splitting",
        "Владелец бюджета и процесс исключений"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Без автоматической проверки бюджеты нарушаются тихо."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Coverage в DevTools показывает 70% неиспользованного JS на старте. Что это подсказывает?",
      "options": [
        "Нужно включить минификацию",
        "Код можно отложить: разделить по маршрутам/взаимодействию",
        "Нужно больше тестов",
        "Ничего"
      ],
      "answer": 1,
      "explain": "Неиспользованный на старте код — кандидат на ленивую загрузку."
    }
  ],
  "tasks": [
    {
      "title": "Проверка бюджета размера",
      "level": "senior",
      "prompt": "Реализуйте `checkBudgets(files, budgets)`. `files` — `{ path, gzipBytes }[]`, `budgets` — `{ pattern, limitKb }[]`, где `pattern` — путь с `*` (любые символы, кроме `/`). Для каждого бюджета суммируйте размер всех подходящих файлов и верните массив нарушений `{ pattern, actualKb, limitKb }` (actualKb округлить до 0.1, 1 KB = 1000 байт) в порядке бюджетов.",
      "starter": "function checkBudgets(files, budgets) {\n  // ваш код\n}",
      "solution": "function checkBudgets(files, budgets) {\n  const toRegExp = (pattern) =>\n    new RegExp('^' + pattern.split('*').map((s) => s.replace(/[.+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('[^/]*') + '$');\n  const violations = [];\n  for (const { pattern, limitKb } of budgets) {\n    const re = toRegExp(pattern);\n    const bytes = files.filter((f) => re.test(f.path)).reduce((sum, f) => sum + f.gzipBytes, 0);\n    const actualKb = Math.round(bytes / 100) / 10;\n    if (actualKb > limitKb) violations.push({ pattern, actualKb, limitKb });\n  }\n  return violations;\n}",
      "tests": [
        {
          "name": "нарушение",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); const files = [{ path: \"dist/assets/index-a1.js\", gzipBytes: 130000 }, { path: \"dist/assets/vendor-b2.js\", gzipBytes: 80000 }]; return eq(checkBudgets(files, [{ pattern: \"dist/assets/index-*.js\", limitKb: 120 }, { pattern: \"dist/assets/vendor-*.js\", limitKb: 90 }]), [{ pattern: \"dist/assets/index-*.js\", actualKb: 130, limitKb: 120 }]);"
        },
        {
          "name": "сумма нескольких файлов",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); const files = [{ path: \"a/x-1.js\", gzipBytes: 60500 }, { path: \"a/x-2.js\", gzipBytes: 60000 }]; return eq(checkBudgets(files, [{ pattern: \"a/x-*.js\", limitKb: 100 }]), [{ pattern: \"a/x-*.js\", actualKb: 120.5, limitKb: 100 }]);"
        },
        {
          "name": "* не проходит через /",
          "code": "return checkBudgets([{ path: \"a/b/c.js\", gzipBytes: 999999 }], [{ pattern: \"a/*.js\", limitKb: 1 }]).length === 0;"
        },
        {
          "name": "точка — не любой символ",
          "code": "return checkBudgets([{ path: \"aXjs\", gzipBytes: 999999 }], [{ pattern: \"a.js\", limitKb: 1 }]).length === 0;"
        }
      ]
    }
  ]
});
