QUIZ.register({
  "id": "01-javascript/15-whats-new",
  "section": "01-javascript",
  "title": "Новинки JavaScript ES2023–ES2027",
  "order": 15,
  "source": "../01-javascript/15-whats-new.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что означает Stage 4 в процессе TC39?",
      "options": [
        "Идея обсуждается",
        "Спецификация черновая",
        "Предложение завершено: есть тесты и две реализации, войдёт в ближайшую редакцию стандарта",
        "Фича удалена"
      ],
      "answer": 2,
      "explain": "Stage 3 — рекомендовано к реализации в движках, Stage 4 — завершено."
    },
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "const arr = [3, 1, 2];\nconst s = arr.toSorted();\nconsole.log(arr[0], s[0]);",
      "options": [
        "`1 1`",
        "`3 1`",
        "`3 3`",
        "`1 3`"
      ],
      "answer": 1,
      "explain": "`toSorted` (ES2023) возвращает отсортированную копию, исходный массив не меняется."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой метод (ES2023) иммутабельно заменяет элемент по индексу?",
      "options": [
        "`arr.replace(i, v)`",
        "`arr.with(i, v)`",
        "`arr.set(i, v)`",
        "`arr.toSpliced(i, v)`"
      ],
      "answer": 1,
      "explain": "`with(index, value)` возвращает копию с заменённым элементом."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем iterator helpers (`iter.map().filter().take()`) отличаются от методов массивов?",
      "options": [
        "Ничем, это алиасы",
        "Они ленивые: элементы обрабатываются по запросу, промежуточные массивы не создаются, работают с бесконечными итераторами",
        "Они всегда быстрее в 10 раз",
        "Они мутируют исходную коллекцию"
      ],
      "answer": 1,
      "explain": "Ленивость позволяет обрабатывать потоки и бесконечные генераторы и рано останавливаться через `take`."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что вошло в ES2025?",
      "options": [
        "Методы Set (`union`, `intersection`…)",
        "Iterator helpers",
        "`Promise.try`",
        "Temporal",
        "`RegExp.escape`",
        "`Object.groupBy`"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Temporal — ES2027, `Object.groupBy` — ES2024."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что возвращает `Promise.withResolvers()`?",
      "options": [
        "Новый промис",
        "`{ promise, resolve, reject }`",
        "Массив промисов",
        "Функцию-резолвер"
      ],
      "answer": 1,
      "explain": "Позволяет управлять промисом снаружи конструктора: превратить событие в промис, реализовать очередь."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем нужен `using` (Explicit Resource Management)?",
      "options": [
        "Для импорта модулей",
        "Для автоматического вызова `[Symbol.dispose]()` при выходе из блока, даже при исключении",
        "Для объявления констант",
        "Для включения strict mode"
      ],
      "answer": 1,
      "explain": "Замена ручного `try...finally` для соединений, подписок, блокировок. `await using` — для асинхронной очистки."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие проблемы `Date` решает Temporal?",
      "options": [
        "изменяемость объектов",
        "месяцы с нуля",
        "нет нормальной поддержки часовых поясов и календарей",
        "неудобная и ошибочная арифметика дат",
        "отсутствие миллисекунд"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "Миллисекунды у `Date` есть. Temporal даёт неизменяемые `PlainDate`, `ZonedDateTime`, `Instant`, `Duration`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему `Error.isError(e)` надёжнее `e instanceof Error`?",
      "options": [
        "Он быстрее",
        "Работает для ошибок из другого realm (iframe, vm), где `instanceof` возвращает false",
        "Проверяет стек вызовов",
        "Поддерживает строки"
      ],
      "answer": 1,
      "explain": "У каждого realm свой конструктор `Error`. `Error.isError` проверяет внутренний слот объекта."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `Math.sumPrecise([1e20, 0.1, -1e20])` отличается от суммы через `reduce`?",
      "options": [
        "Ничем",
        "Даёт точный `0.1`, а `reduce` из-за промежуточного округления даёт `0`",
        "Работает только с BigInt",
        "Сортирует числа перед суммированием"
      ],
      "answer": 1,
      "explain": "Он вычисляет сумму без накопления ошибки округления промежуточных результатов."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему транспиляция (Babel/SWC) не делает `Object.groupBy` доступным в старом браузере?",
      "options": [
        "Транспилятор переписывает только синтаксис; новые API нужно добавить полифиллом (core-js)",
        "Babel это умеет по умолчанию",
        "Это невозможно в принципе",
        "Нужно включить strict mode"
      ],
      "answer": 0,
      "explain": "Синтаксис транспилируется, API полифиллится. Без полифилла будет `TypeError: ... is not a function`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как импортировать JSON как модуль по стандарту ES2025?",
      "options": [
        "`import data from './data.json'`",
        "`import data from './data.json' with { type: 'json' }`",
        "`import json './data.json'`",
        "`require('./data.json')`"
      ],
      "answer": 1,
      "explain": "Import attributes указывают тип модуля — защита от подмены JSON на исполняемый JS."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Какие новые возможности JS вы используете в работе и как решаете вопрос поддержки браузерами?",
      "answer": "Назвать 4–6 фич с пользой: `toSorted`/`with` для иммутабельного state, `Object.groupBy`, `structuredClone`, `Promise.withResolvers`, Set-методы, iterator helpers, Error `cause`, `using`. Поддержка: целевые браузеры в `browserslist`; синтаксис транспилирует SWC/esbuild; API закрывают полифиллы core-js (`useBuiltIns: usage`); `lib` в tsconfig согласован с целевыми средами; мониторинг ошибок «is not a function» в Sentry."
    }
  ],
  "tasks": [
    {
      "title": "Полифилл groupBy",
      "level": "middle",
      "prompt": "Напишите `groupBy(items, keyFn)` как `Object.groupBy`: объект без прототипа, ключи — `keyFn(item, index)`, значения — массивы в исходном порядке. `items` — любой итерируемый.",
      "starter": "function groupBy(items, keyFn) {\n  // ваш код\n}",
      "solution": "function groupBy(items, keyFn) {\n  const result = Object.create(null);\n  let index = 0;\n  for (const item of items) {\n    const key = keyFn(item, index++);\n    (result[key] ??= []).push(item);\n  }\n  return result;\n}",
      "tests": [
        {
          "name": "группировка",
          "code": "const r = groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even')); return r.odd.join() === '1,3' && r.even.join() === '2,4';"
        },
        {
          "name": "без прототипа",
          "code": "return Object.getPrototypeOf(groupBy([1], () => 'a')) === null;"
        },
        {
          "name": "итерируемый и индекс",
          "code": "const r = groupBy(new Set(['a', 'b', 'c']), (_, i) => (i < 2 ? 'first' : 'rest')); return r.first.join('') === 'ab' && r.rest.join('') === 'c';"
        }
      ]
    },
    {
      "title": "Очередь на withResolvers",
      "level": "senior",
      "prompt": "`createDeferredQueue()` → `{ push(value), next() }`. `next()` возвращает промис со следующим значением; если значений нет — ждёт следующего `push`. Порядок FIFO.",
      "starter": "function createDeferredQueue() {\n  // ваш код\n}",
      "solution": "function createDeferredQueue() {\n  const values = [];\n  const waiters = [];\n  return {\n    push(value) {\n      const waiter = waiters.shift();\n      if (waiter) waiter.resolve(value);\n      else values.push(value);\n    },\n    next() {\n      if (values.length > 0) return Promise.resolve(values.shift());\n      const deferred = Promise.withResolvers();\n      waiters.push(deferred);\n      return deferred.promise;\n    },\n  };\n}",
      "tests": [
        {
          "name": "ожидание push",
          "code": "const q = createDeferredQueue(); const p = q.next(); q.push(1); return (await p) === 1;"
        },
        {
          "name": "буфер значений и FIFO",
          "code": "const q = createDeferredQueue(); q.push(1); q.push(2); return (await q.next()) === 1 && (await q.next()) === 2;"
        }
      ]
    },
    {
      "title": "Ленивая пагинация firstMatching",
      "level": "senior",
      "prompt": "`pages` — итератор (генератор) массивов. Верните первые `n` элементов, удовлетворяющих `predicate`, не запрашивая лишних страниц. Используйте iterator helpers.",
      "starter": "function firstMatching(pages, predicate, n) {\n  // ваш код\n}",
      "solution": "function firstMatching(pages, predicate, n) {\n  return pages.flatMap((page) => page).filter(predicate).take(n).toArray();\n}",
      "tests": [
        {
          "name": "результат и лишние страницы",
          "code": "let fetched = 0; function* pages() { for (let p = 0; p < 100; p++) { fetched++; yield [p * 3, p * 3 + 1, p * 3 + 2]; } } const r = firstMatching(pages(), (x) => x % 2 === 0, 3); return r.join() === '0,2,4' && fetched === 2;"
        }
      ]
    }
  ]
});
