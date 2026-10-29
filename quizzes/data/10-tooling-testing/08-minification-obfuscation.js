QUIZ.register({
  "id": "10-tooling-testing/08-minification-obfuscation",
  "section": "10-tooling-testing",
  "title": "Минификация, сжатие и обфускация",
  "order": 8,
  "source": "../10-tooling-testing/08-minification-obfuscation.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что из этого делает минификатор, а не алгоритм сжатия вроде gzip?",
      "options": [
        "Заменяет повторяющиеся последовательности байт ссылками назад",
        "Переименовывает локальные переменные в короткие имена и удаляет недостижимый код",
        "Добавляет заголовок `Content-Encoding`",
        "Шифрует строки в бандле"
      ],
      "answer": 1,
      "explain": "Минификатор работает с AST: знает области видимости и смысл кода. Сжатие работает с байтами и ничего не знает о JS."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Во что минификатор превратит этот код в продакшен-сборке?",
      "code": "if (process.env.NODE_ENV !== 'production') {\n  console.log('debug', state);\n}",
      "lang": "js",
      "options": [
        "Оставит как есть: минификатор не трогает условия",
        "Удалит весь `if`: после подстановки `define` условие становится `false`",
        "Удалит только `console.log`",
        "Заменит условие на `!0`"
      ],
      "answer": 1,
      "explain": "Сборщик подставляет `'production'` вместо `process.env.NODE_ENV`, условие сворачивается в константу, ветка становится недостижимой и удаляется."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что означает комментарий `/*#__PURE__*/` перед вызовом функции?",
      "options": [
        "Функция чистая и её результат можно кэшировать",
        "Вызов не имеет побочных эффектов: если результат не используется, его можно удалить",
        "Вызов нужно выполнить при сборке",
        "Минификатор не должен переименовывать функцию"
      ],
      "answer": 1,
      "explain": "Без пометки минификатор обязан оставить вызов — вдруг он что-то регистрирует. С пометкой неиспользуемый результат удаляется вместе с вызовом."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему этот код работает в dev и ломается в продакшене?",
      "code": "class Admin extends User {}\n\nfunction canEdit(user) {\n  return user.constructor.name === 'Admin';\n}",
      "lang": "js",
      "options": [
        "`instanceof` не работает после минификации",
        "Минификатор переименовал класс, и `constructor.name` больше не равен `'Admin'`",
        "Классы не поддерживаются минификаторами",
        "Gzip повредил строку `'Admin'`"
      ],
      "answer": 1,
      "explain": "Имена классов и функций — локальные идентификаторы, их сокращают. Не завязывайтесь на имена или используйте `instanceof`; крайний вариант — `keep_classnames`/`keepNames`."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что может сломать или ухудшить минификацию?",
      "options": [
        "Код опирается на `fn.name` или `constructor.name`",
        "Включено переименование свойств, а объект приходит с сервера",
        "Использование `eval` в функции",
        "Использование стрелочных функций",
        "Включены `unsafe`-опции compress без тестов на собранном бандле"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "`eval` заставляет минификатор отключить переименование в области видимости. Стрелочные функции минифицируются без проблем."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему опасно `drop: ['console']` в esbuild или `drop_console: true` в Terser?",
      "options": [
        "Это замедляет сборку в разы",
        "Удалятся и `console.error`/`console.warn`, и выражения в аргументах: `console.log(track())` потеряет вызов `track()`",
        "Браузер покажет предупреждение о модифицированном коде",
        "Это ломает sourcemaps"
      ],
      "answer": 1,
      "explain": "Удаляется весь вызов вместе с аргументами. Безопаснее точечно пометить `pure: ['console.log', 'console.debug']`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Зачем ответу с `Content-Encoding: br` заголовок `Vary: Accept-Encoding`?",
      "options": [
        "Без него браузер не распакует ответ",
        "Чтобы CDN и прокси хранили разные варианты и не отдали Brotli клиенту, который его не поддерживает",
        "Он ускоряет распаковку",
        "Он обязателен только для HTTP/1.1"
      ],
      "answer": 1,
      "explain": "`Vary` говорит кэшам, от каких заголовков запроса зависит ответ. Без него в кэше окажется один вариант для всех."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как разумно сжимать статику и динамические ответы?",
      "options": [
        "Всё на лету Brotli уровня 11",
        "Статику — Brotli 11 заранее при сборке, динамические ответы — на лету средним уровнем Brotli/gzip или Zstandard",
        "Статику не сжимать, она кэшируется",
        "Всё gzip уровня 9, Brotli нестабилен"
      ],
      "answer": 1,
      "explain": "Высокие уровни Brotli очень медленные — допустимо один раз при сборке. На лету важнее не потратить на сжатие больше времени, чем сэкономили на сети."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Бандл весит 250 КБ в Brotli и 1 МБ без сжатия. Что определяет стоимость парсинга и компиляции в главном потоке?",
      "options": [
        "250 КБ — браузер парсит сжатые данные",
        "1 МБ — парсится и компилируется распакованный код",
        "Только количество модулей",
        "Ничего, парсинг происходит в Service Worker"
      ],
      "answer": 1,
      "explain": "Сжатие экономит сеть. Парсинг, компиляция и выполнение работают с распакованным кодом, поэтому важны оба числа."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что верно про обфускацию JS?",
      "options": [
        "Код после обфускации обычно больше и медленнее",
        "Расшифрованные строки видны в отладчике во время выполнения",
        "Обфускация делает безопасным хранение API-ключа в бандле",
        "Есть автоматические деобфускаторы для типовых приёмов",
        "Режимы с `eval`/`new Function` могут конфликтовать с CSP"
      ],
      "answer": [
        0,
        1,
        3,
        4
      ],
      "explain": "Код в браузере всегда доступен пользователю. Обфускация поднимает цену анализа, но секреты в бандле остаются публичными."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Где утекает больше всего информации об исходном коде продакшен-приложения?",
      "options": [
        "В минифицированных именах переменных",
        "В опубликованных на CDN sourcemaps",
        "В заголовке `Content-Encoding`",
        "В хэше в имени файла"
      ],
      "answer": 1,
      "explain": "Sourcemap содержит исходники (`sourcesContent`) и исходные имена. Используйте `hidden`-карты и загружайте их только в систему мониторинга."
    },
    {
      "type": "open",
      "level": "lead",
      "q": "Продакт просит «зашифровать фронтенд», чтобы конкуренты не скопировали новую фичу. Что ответите и что предложите?",
      "answer": "Честно скажу, что код в браузере защитить полностью нельзя: браузер должен его выполнить, DevTools и деобфускаторы его раскроют. Уточню угрозу. Ценный алгоритм — перенести на сервер и отдавать результат. Злоупотребление API — авторизация, лимиты, мониторинг аномалий на сервере. Нужен барьер от простого копирования — обфусцировать один чувствительный чанк после минификации, измерив цену: размер, скорость на слабых устройствах, совместимость с CSP, отладку через sourcemaps. Проверю, что в бандле нет секретов и не опубликованы sourcemaps. Решение оформлю как ADR с компромиссами."
    }
  ],
  "tasks": [
    {
      "title": "Удалить комментарии, не трогая строки",
      "level": "middle",
      "prompt": "Реализуйте `stripComments(code)` — первый шаг минификатора. Удалите строчные комментарии `// ...` (до перевода строки, сам перевод строки оставьте) и блочные `/* ... */` целиком. Блочные комментарии, начинающиеся с `/*!` (лицензии), сохраните. Внутри строк в одинарных, двойных и обратных кавычках ничего не трогайте; учтите экранирование `\\'`. Регулярные выражения и вложенные `${}` в шаблонах можно не учитывать.",
      "starter": "function stripComments(code) {\n  // ваш код\n}",
      "solution": "function stripComments(code) {\n  let out = '';\n  let i = 0;\n  while (i < code.length) {\n    const ch = code[i];\n    if (ch === '\"' || ch === \"'\" || ch === '`') {\n      let j = i + 1;\n      while (j < code.length && code[j] !== ch) j += code[j] === '\\\\' ? 2 : 1;\n      out += code.slice(i, j + 1);\n      i = j + 1;\n    } else if (ch === '/' && code[i + 1] === '/') {\n      while (i < code.length && code[i] !== '\\n') i++;\n    } else if (ch === '/' && code[i + 1] === '*') {\n      const end = code.indexOf('*/', i + 2);\n      const stop = end === -1 ? code.length : end + 2;\n      if (code[i + 2] === '!') out += code.slice(i, stop);\n      i = stop;\n    } else {\n      out += ch;\n      i++;\n    }\n  }\n  return out;\n}",
      "tests": [
        {
          "name": "строчный комментарий",
          "code": "return stripComments('a = 1; // set a\\nb = 2;') === 'a = 1; \\nb = 2;';"
        },
        {
          "name": "блочный комментарий",
          "code": "return stripComments('x /* multi\\nline */ + y') === 'x  + y';"
        },
        {
          "name": "// внутри строки не комментарий",
          "code": "return stripComments(\"const url = 'http://example.com'; // api\") === \"const url = 'http://example.com'; \";"
        },
        {
          "name": "экранированная кавычка",
          "code": "const src = \"s = 'it\\\\'s // fine'; /* x */\";\nreturn stripComments(src) === \"s = 'it\\\\'s // fine'; \";"
        },
        {
          "name": "шаблонная строка и двойные кавычки",
          "code": "return stripComments('a = `/* keep */`; b = \"// keep\"; /* drop */') === 'a = `/* keep */`; b = \"// keep\"; ';"
        },
        {
          "name": "лицензионный комментарий сохраняется",
          "code": "return stripComments('/*! MIT License */\\n/* internal */code()') === '/*! MIT License */\\ncode()';"
        }
      ]
    },
    {
      "title": "Генератор коротких имён для mangle",
      "level": "senior",
      "prompt": "Реализуйте `createNameGenerator(reserved = [])` — возвращает функцию `next()`, которая при каждом вызове выдаёт следующее короткое имя, как это делает минификатор. Первый символ — из алфавита `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_` (54 символа), следующие — из того же алфавита плюс цифры `0123456789` в конце (64 символа). Порядок: сначала все однобуквенные имена в порядке алфавита, затем двухбуквенные (`aa`, `ab`, …, `a9`, `ba`, …), затем трёхбуквенные и так далее. Имена из `reserved` (например, ключевые слова `do`, `if`, `in`) пропускайте.",
      "starter": "function createNameGenerator(reserved = []) {\n  // ваш код\n}",
      "solution": "function createNameGenerator(reserved = []) {\n  const FIRST = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_';\n  const REST = FIRST + '0123456789';\n  const skip = new Set(reserved);\n  let index = 0;\n  const nameAt = (n) => {\n    let length = 1;\n    let count = FIRST.length;\n    while (n >= count) {\n      n -= count;\n      count *= REST.length;\n      length++;\n    }\n    let name = '';\n    for (let k = 1; k < length; k++) {\n      name = REST[n % REST.length] + name;\n      n = Math.floor(n / REST.length);\n    }\n    return FIRST[n] + name;\n  };\n  return function next() {\n    let name;\n    do {\n      name = nameAt(index++);\n    } while (skip.has(name));\n    return name;\n  };\n}",
      "tests": [
        {
          "name": "первые имена",
          "code": "const next = createNameGenerator();\nreturn [next(), next(), next()].join() === 'a,b,c';"
        },
        {
          "name": "переход к двухбуквенным",
          "code": "const next = createNameGenerator();\nconst names = Array.from({ length: 56 }, next);\nreturn names[25] === 'z' && names[26] === 'A' && names[53] === '_' && names[54] === 'aa' && names[55] === 'ab';"
        },
        {
          "name": "после a9 идёт ba",
          "code": "const next = createNameGenerator();\nconst names = Array.from({ length: 119 }, next);\nreturn names[117] === 'a9' && names[118] === 'ba';"
        },
        {
          "name": "пропускает зарезервированные",
          "code": "const next = createNameGenerator(['b', 'do', 'if']);\nconst names = Array.from({ length: 400 }, next);\nconst i = names.indexOf('dn');\nreturn names[0] === 'a' && names[1] === 'c' && !names.includes('do') && !names.includes('if') && names[i + 1] === 'dp';"
        },
        {
          "name": "имена уникальны и валидны",
          "code": "const next = createNameGenerator();\nconst names = Array.from({ length: 5000 }, next);\nreturn new Set(names).size === 5000 && names.every((n) => /^[A-Za-z$_][A-Za-z0-9$_]*$/.test(n)) && names[4999].length === 3;"
        }
      ]
    },
    {
      "title": "Выбрать Content-Encoding по Accept-Encoding",
      "level": "senior",
      "prompt": "Реализуйте `pickEncoding(acceptEncoding, available)`. `available` — алгоритмы, которые есть у сервера, в порядке его предпочтения (например, `['zstd', 'br', 'gzip']`). Разберите заголовок: элементы через запятую, у каждого необязательный вес `;q=0.5` (по умолчанию 1), регистр и пробелы не важны. Вес алгоритма — его собственный, если он указан, иначе вес `*`, если указан, иначе алгоритм недопустим. Верните доступный алгоритм с наибольшим положительным весом, при равенстве — тот, что раньше в `available`. Если ни один не подошёл, верните `'identity'` (без сжатия), но если `identity` запрещён (`identity;q=0`, или `*;q=0` без явного `identity`) — верните `null`. Пустой заголовок означает `'identity'`.",
      "starter": "function pickEncoding(acceptEncoding, available) {\n  // ваш код\n}",
      "solution": "function pickEncoding(acceptEncoding, available) {\n  if (!acceptEncoding) return 'identity';\n  const weights = new Map();\n  for (const part of acceptEncoding.split(',')) {\n    const [token, ...params] = part.split(';');\n    const name = token.trim().toLowerCase();\n    if (!name) continue;\n    let q = 1;\n    for (const param of params) {\n      const [key, value] = param.split('=').map((s) => s.trim());\n      if (key === 'q') q = Number(value);\n    }\n    weights.set(name, Number.isNaN(q) ? 0 : q);\n  }\n  const weightOf = (enc) =>\n    weights.has(enc) ? weights.get(enc) : weights.has('*') ? weights.get('*') : undefined;\n  let best = null;\n  let bestQ = 0;\n  for (const enc of available) {\n    const q = weightOf(enc) ?? 0;\n    if (q > bestQ) {\n      best = enc;\n      bestQ = q;\n    }\n  }\n  if (best) return best;\n  return weightOf('identity') === 0 ? null : 'identity';\n}",
      "tests": [
        {
          "name": "браузер умеет всё — приоритет сервера",
          "code": "return pickEncoding('gzip, deflate, br, zstd', ['zstd', 'br', 'gzip']) === 'zstd';"
        },
        {
          "name": "без zstd выбирается br",
          "code": "return pickEncoding('gzip, br', ['zstd', 'br', 'gzip']) === 'br';"
        },
        {
          "name": "вес клиента важнее приоритета сервера",
          "code": "return pickEncoding('gzip;q=1.0, br;q=0.5', ['zstd', 'br', 'gzip']) === 'gzip';"
        },
        {
          "name": "q=0 запрещает алгоритм",
          "code": "return pickEncoding('br;q=0, gzip', ['br', 'gzip']) === 'gzip';"
        },
        {
          "name": "звёздочка",
          "code": "return pickEncoding('*', ['zstd', 'br']) === 'zstd' && pickEncoding('*;q=0.5, gzip', ['zstd', 'gzip']) === 'gzip';"
        },
        {
          "name": "регистр и пробелы",
          "code": "return pickEncoding('  GZIP ; q=0.8 ', ['br', 'gzip']) === 'gzip';"
        },
        {
          "name": "ничего не подошло — identity",
          "code": "return pickEncoding('deflate', ['br', 'gzip']) === 'identity' && pickEncoding('', ['br']) === 'identity';"
        },
        {
          "name": "identity запрещён",
          "code": "return pickEncoding('identity;q=0', ['br']) === null && pickEncoding('*;q=0', ['br']) === null && pickEncoding('*;q=0, identity', ['br']) === 'identity';"
        }
      ]
    }
  ]
});
