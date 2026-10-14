QUIZ.register({
  "id": "14-design-systems/05-css-architecture",
  "section": "14-design-systems",
  "title": "CSS-архитектура в масштабе",
  "order": 5,
  "source": "../14-design-systems/05-css-architecture.md",
  "questions": [
    {
      "type": "single",
      "level": "senior",
      "q": "`@layer ds, app;` — стиль `.checkout .button` в `app` и `.button.button--primary.is-large` в `ds`. Кто победит?",
      "options": [
        "ds — выше специфичность",
        "app — более поздний слой важнее специфичности",
        "тот, что подключён позже",
        "зависит от браузера"
      ],
      "answer": 1,
      "explain": "Порядок слоёв проверяется раньше специфичности."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какая специфичность у `:where(.card .title)`?",
      "options": [
        "0,2,0",
        "0,1,0",
        "0,0,0",
        "1,0,0"
      ],
      "answer": 2,
      "explain": "`:where()` обнуляет специфичность — удобно для базовых стилей библиотек."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему runtime CSS-in-JS плохо сочетается с React Server Components?",
      "options": [
        "RSC не поддерживают CSS",
        "Стили вычисляются и вставляются в рантайме через контекст, которого нет в серверных компонентах",
        "Из-за TypeScript",
        "Сочетается отлично"
      ],
      "answer": 1,
      "explain": "Zero-runtime решения и CSS Modules этой проблемы не имеют."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Карточка должна менять раскладку в узком сайдбаре и широкой колонке. Что использовать?",
      "options": [
        "media queries",
        "container queries",
        "`!important`",
        "JS-измерение ширины окна"
      ],
      "answer": 1,
      "explain": "Компонент реагирует на размер своего контейнера."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Кто задаёт отступ между компонентами?",
      "options": [
        "Сам компонент внешним `margin`",
        "Родитель / layout-примитив через `gap`",
        "Глобальный CSS",
        "Никто"
      ],
      "answer": 1,
      "explain": "Иначе компонент нельзя переиспользовать в другом контексте."
    }
  ],
  "tasks": [
    {
      "title": "Специфичность селектора",
      "level": "senior",
      "prompt": "Реализуйте `specificity(selector)` → `[a, b, c]` для простых селекторов без запятых: `#id` → a; `.class`, `[attr]`, псевдоклассы → b; теги и псевдоэлементы (`::before`) → c. `*` и комбинаторы не считаются. `:where(...)` даёт 0, `:is(...)` и `:not(...)` — специфичность самого специфичного аргумента (аргументы разделены запятой).",
      "starter": "function specificity(selector) {\n  // ваш код\n}",
      "solution": "function specificity(selector) {\n  const result = [0, 0, 0];\n  const add = (s) => s.forEach((v, i) => (result[i] += v));\n  const max = (list) => list.map(specificity).reduce((best, s) => (s[0] - best[0] || s[1] - best[1] || s[2] - best[2]) > 0 ? s : best, [0, 0, 0]);\n  let i = 0;\n  const src = selector;\n  const readArgs = (start) => {\n    let depth = 0;\n    for (let j = start; j < src.length; j++) {\n      if (src[j] === '(') depth++;\n      else if (src[j] === ')') {\n        depth--;\n        if (depth === 0) return [src.slice(start + 1, j), j + 1];\n      }\n    }\n    throw new Error('Нет закрывающей скобки');\n  };\n  const splitTop = (s) => {\n    const parts = [];\n    let depth = 0, last = 0;\n    for (let j = 0; j < s.length; j++) {\n      if (s[j] === '(') depth++;\n      else if (s[j] === ')') depth--;\n      else if (s[j] === ',' && depth === 0) { parts.push(s.slice(last, j).trim()); last = j + 1; }\n    }\n    parts.push(s.slice(last).trim());\n    return parts;\n  };\n  while (i < src.length) {\n    const ch = src[i];\n    if (ch === '#') { result[0]++; i++; while (i < src.length && /[\\w-]/.test(src[i])) i++; }\n    else if (ch === '.') { result[1]++; i++; while (i < src.length && /[\\w-]/.test(src[i])) i++; }\n    else if (ch === '[') { result[1]++; i = src.indexOf(']', i) + 1; }\n    else if (src.startsWith('::', i)) { result[2]++; i += 2; while (i < src.length && /[\\w-]/.test(src[i])) i++; }\n    else if (ch === ':') {\n      i++;\n      let name = '';\n      while (i < src.length && /[\\w-]/.test(src[i])) name += src[i++];\n      if (src[i] === '(') {\n        const [args, end] = readArgs(i);\n        i = end;\n        if (name === 'where') continue;\n        if (name === 'is' || name === 'not' || name === 'has') { add(max(splitTop(args))); continue; }\n      }\n      result[1]++;\n    }\n    else if (/[a-zA-Z]/.test(ch)) { result[2]++; while (i < src.length && /[\\w-]/.test(src[i])) i++; }\n    else i++;\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "базовые",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(specificity(\"#nav .item a\"), [1, 1, 1]) && eq(specificity(\"ul li::before\"), [0, 0, 3]);"
        },
        {
          "name": "атрибуты и псевдоклассы",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(specificity(\"input[type=text]:focus\"), [0, 2, 1]);"
        },
        {
          "name": ":where",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(specificity(\":where(#a .b) p\"), [0, 0, 1]);"
        },
        {
          "name": ":is берёт максимум",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(specificity(\":is(#a, .b) span\"), [1, 0, 1]);"
        },
        {
          "name": "звёздочка и комбинаторы",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(specificity(\"* > .a + .b ~ div\"), [0, 2, 1]);"
        }
      ],
      "notes": "Упрощённый парсер: не учитывает экранирование и `:nth-child(... of S)`."
    }
  ]
});
