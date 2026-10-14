QUIZ.register({
  "id": "10-tooling-testing/06-packages-monorepo-linting",
  "section": "10-tooling-testing",
  "title": "Пакеты, монорепо, линтеры",
  "order": 6,
  "source": "../10-tooling-testing/06-packages-monorepo-linting.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что такое фантомная зависимость?",
      "options": [
        "Пакет без кода",
        "Пакет, который импортируется в коде, но не объявлен в package.json (доступен из-за hoisting)",
        "Удалённый из npm пакет",
        "devDependency"
      ],
      "answer": 1,
      "explain": "pnpm и Yarn PnP такого не допускают."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Библиотека компонентов на React. Как объявить React?",
      "options": [
        "`dependencies`",
        "`peerDependencies` (+ devDependencies для разработки)",
        "не объявлять",
        "`bundledDependencies`"
      ],
      "answer": 1,
      "explain": "Иначе у приложения окажутся две копии React — «Invalid hook call»."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какие версии допускает `^0.4.2`?",
      "options": [
        "≥0.4.2 <1.0.0",
        "≥0.4.2 <0.5.0",
        "только 0.4.2",
        "≥0.4.2 <0.4.3"
      ],
      "answer": 1,
      "explain": "Для 0.x каретка ведёт себя как тильда: minor считается «мажорным»."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что даёт поле `exports` в package.json?",
      "options": [
        "Список зависимостей",
        "Публичную карту входов пакета с условиями (import/require/types) и закрывает глубокие импорты",
        "Скрипты сборки",
        "Права доступа"
      ],
      "answer": 1,
      "explain": "Импорт пути, не указанного в `exports`, завершится ошибкой."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем линтер отличается от форматтера?",
      "options": [
        "Ничем",
        "Форматтер — внешний вид кода, линтер — ошибки и плохие практики",
        "Линтер только для CSS",
        "Форматтер проверяет типы"
      ],
      "answer": 1,
      "explain": "Правила форматирования в линтере лучше отключить, чтобы не конфликтовали."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает Changesets в монорепо?",
      "options": [
        "Кэширует сборку",
        "Описывает изменения в PR и превращает их в версии, changelog и публикацию пакетов",
        "Проверяет типы",
        "Деплоит приложения"
      ],
      "answer": 1,
      "explain": "Semver-решение принимает автор изменения, а не релиз-менеджер в конце."
    }
  ],
  "tasks": [
    {
      "title": "satisfies: semver ^ и ~",
      "level": "senior",
      "prompt": "Реализуйте `satisfies(version, range)` для версий `MAJOR.MINOR.PATCH` (без пре-релизов) и диапазонов: точная версия, `^x.y.z`, `~x.y.z`, `>=x.y.z`. Правила каретки: для `^0.y.z` (y > 0) — `<0.(y+1).0`, для `^0.0.z` — только `0.0.z`.",
      "starter": "function satisfies(version, range) {\n  // ваш код\n}",
      "solution": "function satisfies(version, range) {\n  const parse = (v) => v.split('.').map(Number);\n  const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];\n  const v = parse(version);\n  if (range.startsWith('>=')) return cmp(v, parse(range.slice(2))) >= 0;\n  if (range.startsWith('~')) {\n    const [ma, mi, pa] = parse(range.slice(1));\n    return cmp(v, [ma, mi, pa]) >= 0 && cmp(v, [ma, mi + 1, 0]) < 0;\n  }\n  if (range.startsWith('^')) {\n    const [ma, mi, pa] = parse(range.slice(1));\n    const upper = ma > 0 ? [ma + 1, 0, 0] : mi > 0 ? [0, mi + 1, 0] : [0, 0, pa + 1];\n    return cmp(v, [ma, mi, pa]) >= 0 && cmp(v, upper) < 0;\n  }\n  return cmp(v, parse(range)) === 0;\n}",
      "tests": [
        {
          "name": "каретка",
          "code": "return satisfies(\"1.9.0\", \"^1.4.2\") && !satisfies(\"2.0.0\", \"^1.4.2\") && !satisfies(\"1.4.1\", \"^1.4.2\");"
        },
        {
          "name": "тильда",
          "code": "return satisfies(\"1.4.9\", \"~1.4.2\") && !satisfies(\"1.5.0\", \"~1.4.2\");"
        },
        {
          "name": "0.x",
          "code": "return satisfies(\"0.4.9\", \"^0.4.2\") && !satisfies(\"0.5.0\", \"^0.4.2\") && satisfies(\"0.0.3\", \"^0.0.3\") && !satisfies(\"0.0.4\", \"^0.0.3\");"
        },
        {
          "name": ">=",
          "code": "return satisfies(\"3.0.0\", \">=2.1.0\") && !satisfies(\"2.0.9\", \">=2.1.0\");"
        },
        {
          "name": "точная",
          "code": "return satisfies(\"1.2.3\", \"1.2.3\") && !satisfies(\"1.2.4\", \"1.2.3\");"
        },
        {
          "name": "числовое сравнение",
          "code": "return satisfies(\"1.10.0\", \"^1.9.0\");"
        }
      ],
      "notes": "Тест «числовое сравнение» ловит сравнение строк: `\"10\" < \"9\"`."
    }
  ]
});
