QUIZ.register({
  "id": "16-forms-i18n-auth/01-forms",
  "section": "16-forms-i18n-auth",
  "title": "Формы и валидация",
  "order": 1,
  "source": "../16-forms-i18n-auth/01-forms.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Почему форма не отправляется по Enter?",
      "options": [
        "Нет `autocomplete`",
        "Кнопка сделана `<div onClick>` и нет `<form>` с `<button type=\"submit\">`",
        "Нет `required`",
        "Нужен `tabindex`"
      ],
      "answer": 1,
      "explain": "Нативная форма даёт отправку по Enter бесплатно."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему react-hook-form быстр на больших формах?",
      "options": [
        "Использует Web Workers",
        "Хранит значения вне React-состояния (uncontrolled) и подписывает только нужные компоненты",
        "Не валидирует поля",
        "Использует Canvas"
      ],
      "answer": 1,
      "explain": "Ввод в одно поле не перерендеривает всю форму."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему нужна серверная валидация, если есть клиентская?",
      "options": [
        "Клиентская медленная",
        "Клиент под контролем пользователя: запрос можно отправить в обход формы",
        "Для SEO",
        "Не нужна"
      ],
      "answer": 1,
      "explain": "Клиентская — для UX, серверная — для корректности и безопасности."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что делает ошибку поля доступной?",
      "options": [
        "`aria-invalid=\"true\"`",
        "`aria-describedby` на текст ошибки",
        "фокус на первое ошибочное поле при отправке",
        "красная рамка без текста",
        "сводка с `role=\"alert\"`"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Цвет не должен быть единственным носителем смысла."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что даёт `<form action={serverAction}>` в React 19 + Next.js?",
      "options": [
        "Только красивый синтаксис",
        "Форма работает до гидратации (progressive enhancement), pending-состояния через `useFormStatus`/`useActionState`",
        "Отключает валидацию",
        "Требует Redux"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какой `autocomplete` у поля пароля при регистрации?",
      "options": [
        "`password`",
        "`new-password`",
        "`off`",
        "`current-password`"
      ],
      "answer": 1,
      "explain": "Менеджер паролей предложит сгенерировать надёжный пароль. `current-password` — для входа."
    }
  ],
  "tasks": [
    {
      "title": "Валидатор формы по схеме",
      "level": "senior",
      "prompt": "Реализуйте `validate(values, rules)`. `rules` — `{ [field]: Array<(value, values) => string | null> }`: функции возвращают текст ошибки или `null`. Верните объект ошибок `{ [field]: string }` — **первую** ошибку каждого поля; поля без ошибок не включаются. Также реализуйте `firstErrorField(errors, order)` — первое поле с ошибкой в порядке `order` (для фокуса) или `null`.",
      "starter": "function validate(values, rules) {\n  // ваш код\n}\n\nfunction firstErrorField(errors, order) {\n  // ваш код\n}",
      "solution": "function validate(values, rules) {\n  const errors = {};\n  for (const [field, checks] of Object.entries(rules)) {\n    for (const check of checks) {\n      const message = check(values[field], values);\n      if (message) {\n        errors[field] = message;\n        break;\n      }\n    }\n  }\n  return errors;\n}\n\nfunction firstErrorField(errors, order) {\n  return order.find((field) => Object.hasOwn(errors, field)) ?? null;\n}",
      "tests": [
        {
          "name": "первая ошибка поля",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); const required = (v) => (v ? null : \"Обязательно\"); const min = (v) => (String(v ?? \"\").length >= 3 ? null : \"Минимум 3\"); return eq(validate({ name: \"\" }, { name: [required, min] }), { name: \"Обязательно\" });"
        },
        {
          "name": "кросс-полевая",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); const same = (v, all) => (v === all.password ? null : \"Не совпадает\"); return eq(validate({ password: \"a\", confirm: \"b\" }, { confirm: [same] }), { confirm: \"Не совпадает\" });"
        },
        {
          "name": "нет ошибок",
          "code": "return Object.keys(validate({ a: \"x\" }, { a: [(v) => (v ? null : \"e\")] })).length === 0;"
        },
        {
          "name": "порядок фокуса",
          "code": "return firstErrorField({ email: \"e\", name: \"n\" }, [\"name\", \"email\"]) === \"name\" && firstErrorField({}, [\"a\"]) === null;"
        }
      ]
    },
    {
      "title": "Асинхронная проверка без гонок",
      "level": "senior",
      "prompt": "Реализуйте `createAsyncValidator(check, delay)` → `validate(value): Promise<string | null | \"stale\">`. Каждый вызов откладывает проверку на `delay` мс (debounce); если до запуска пришёл новый вызов — предыдущий промис резолвится `\"stale\"`. Если проверка уже запущена, а пришёл новый вызов, результат старой проверки тоже `\"stale\"` (ответ устарел). Иначе — результат `check(value)`.",
      "starter": "function createAsyncValidator(check, delay) {\n  // ваш код\n}",
      "solution": "function createAsyncValidator(check, delay) {\n  let version = 0;\n  let pending = null; // { timer, resolve } ещё не запущенной проверки\n  return (value) => {\n    const current = ++version;\n    if (pending) {\n      clearTimeout(pending.timer);\n      pending.resolve('stale');\n    }\n    return new Promise((resolve) => {\n      const timer = setTimeout(async () => {\n        pending = null;\n        const result = await check(value);\n        resolve(current === version ? result : 'stale');\n      }, delay);\n      pending = { timer, resolve };\n    });\n  };\n}",
      "tests": [
        {
          "name": "debounce",
          "code": "let calls = 0; const v = createAsyncValidator(async (x) => { calls++; return x === \"taken\" ? \"Занят\" : null; }, 20); const a = v(\"t\"); const b = v(\"ta\"); const c = v(\"taken\"); const r = await Promise.all([a, b, c]); return calls === 1 && r.join() === \"stale,stale,Занят\";"
        },
        {
          "name": "устаревший ответ",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const v = createAsyncValidator(async (x) => { await sleep(x === \"slow\" ? 60 : 5); return x; }, 5); const first = v(\"slow\"); await sleep(20); const second = v(\"fast\"); return (await first) === \"stale\" && (await second) === \"fast\";"
        },
        {
          "name": "одиночный вызов",
          "code": "const v = createAsyncValidator(async () => null, 5); return (await v(\"x\")) === null;"
        }
      ]
    }
  ]
});
