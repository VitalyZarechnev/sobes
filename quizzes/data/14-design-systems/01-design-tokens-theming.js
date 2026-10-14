QUIZ.register({
  "id": "14-design-systems/01-design-tokens-theming",
  "section": "14-design-systems",
  "title": "Дизайн-токены и темы",
  "order": 1,
  "source": "../14-design-systems/01-design-tokens-theming.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой токен должен использовать компонент кнопки для фона?",
      "options": [
        "`blue-600`",
        "`#2563eb`",
        "`color-bg-accent`",
        "`primary-blue`"
      ],
      "answer": 2,
      "explain": "Семантический токен — точка переопределения для тем и брендов."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как избежать мигания тёмной темы при SSR?",
      "options": [
        "Переключать тему в `useEffect`",
        "Хранить выбор в cookie и рендерить `data-theme` на сервере (или inline-скрипт в head)",
        "Использовать `!important`",
        "Добавить анимацию перехода"
      ],
      "answer": 1,
      "explain": "Тема должна быть известна до первой отрисовки."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `light-dark(#fff, #000)`?",
      "options": [
        "Выбирает значение по `prefers-contrast`",
        "Выбирает значение по текущей `color-scheme` элемента",
        "Смешивает цвета",
        "Работает только в SVG"
      ],
      "answer": 1,
      "explain": "Требует `color-scheme: light dark` на элементе или предке."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Минимальный контраст обычного текста по WCAG 2.2 AA?",
      "options": [
        "3:1",
        "4.5:1",
        "7:1",
        "2:1"
      ],
      "answer": 1,
      "explain": "3:1 — для крупного текста и элементов интерфейса, 7:1 — уровень AAA."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что верно про три уровня токенов?",
      "options": [
        "Примитивы — палитра и шкалы",
        "Темы переопределяют семантический уровень",
        "Компонентные токены нужно создавать для каждого свойства каждого компонента",
        "Компоненты используют семантику"
      ],
      "answer": [
        0,
        1,
        3
      ],
      "explain": "Компонентные токены — точечно, иначе их тысячи."
    }
  ],
  "tasks": [
    {
      "title": "Разрешение ссылок токенов",
      "level": "senior",
      "prompt": "Токены — плоский объект `{ \"color.blue.600\": \"#2563eb\", \"color.bg.accent\": \"{color.blue.600}\" }`. Реализуйте `resolveTokens(tokens)`: вернуть новый объект, где все ссылки `{path}` заменены итоговыми значениями (ссылки могут быть цепочками и встречаться внутри строки, например `\"1px solid {color.border}\"`). Несуществующая ссылка или цикл — бросить `Error`.",
      "starter": "function resolveTokens(tokens) {\n  // ваш код\n}",
      "solution": "function resolveTokens(tokens) {\n  const resolved = new Map();\n  const resolve = (name, stack) => {\n    if (resolved.has(name)) return resolved.get(name);\n    if (!Object.hasOwn(tokens, name)) throw new Error(`Нет токена ${name}`);\n    if (stack.has(name)) throw new Error(`Цикл: ${[...stack, name].join(' → ')}`);\n    stack.add(name);\n    const value = String(tokens[name]).replace(/\\{([^}]+)\\}/g, (_, ref) => resolve(ref, stack));\n    stack.delete(name);\n    resolved.set(name, value);\n    return value;\n  };\n  return Object.fromEntries(Object.keys(tokens).map((name) => [name, resolve(name, new Set())]));\n}",
      "tests": [
        {
          "name": "цепочка",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); return eq(resolveTokens({ \"a\": \"#fff\", \"b\": \"{a}\", \"c\": \"{b}\" }), { a: \"#fff\", b: \"#fff\", c: \"#fff\" });"
        },
        {
          "name": "внутри строки",
          "code": "return resolveTokens({ \"w\": \"1px\", \"c\": \"red\", \"border\": \"{w} solid {c}\" }).border === \"1px solid red\";"
        },
        {
          "name": "нет токена",
          "code": "try { resolveTokens({ a: \"{x}\" }); return false; } catch (e) { return e instanceof Error; }"
        },
        {
          "name": "цикл",
          "code": "try { resolveTokens({ a: \"{b}\", b: \"{a}\" }); return false; } catch (e) { return e instanceof Error; }"
        },
        {
          "name": "не мутирует",
          "code": "const t0 = { a: \"1\", b: \"{a}\" }; resolveTokens(t0); return t0.b === \"{a}\";"
        }
      ]
    },
    {
      "title": "Контраст по WCAG",
      "level": "senior",
      "prompt": "Реализуйте `contrastRatio(hex1, hex2)` для цветов `#rrggbb` по формуле WCAG (относительная яркость с линеаризацией sRGB: `c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4`, `L = 0.2126R + 0.7152G + 0.0722B`, отношение `(L1 + 0.05) / (L2 + 0.05)`, где L1 — светлее). Верните число, округлённое до 2 знаков. И `passesAA(fg, bg, large = false)`: порог 4.5 или 3 для крупного текста.",
      "starter": "function contrastRatio(hex1, hex2) {\n  // ваш код\n}\n\nfunction passesAA(fg, bg, large = false) {\n  // ваш код\n}",
      "solution": "function contrastRatio(hex1, hex2) {\n  const luminance = (hex) => {\n    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)\n      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));\n    return 0.2126 * r + 0.7152 * g + 0.0722 * b;\n  };\n  const [hi, lo] = [luminance(hex1), luminance(hex2)].sort((a, b) => b - a);\n  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;\n}\n\nfunction passesAA(fg, bg, large = false) {\n  return contrastRatio(fg, bg) >= (large ? 3 : 4.5);\n}",
      "tests": [
        {
          "name": "чёрный на белом",
          "code": "return contrastRatio(\"#000000\", \"#ffffff\") === 21;"
        },
        {
          "name": "порядок не важен",
          "code": "return contrastRatio(\"#ffffff\", \"#767676\") === contrastRatio(\"#767676\", \"#ffffff\");"
        },
        {
          "name": "#767676 на белом ≈ 4.54",
          "code": "return contrastRatio(\"#767676\", \"#ffffff\") === 4.54 && passesAA(\"#767676\", \"#ffffff\");"
        },
        {
          "name": "#777777 не проходит AA",
          "code": "return !passesAA(\"#777777\", \"#ffffff\") && passesAA(\"#777777\", \"#ffffff\", true);"
        },
        {
          "name": "одинаковые",
          "code": "return contrastRatio(\"#336699\", \"#336699\") === 1;"
        }
      ]
    }
  ]
});
