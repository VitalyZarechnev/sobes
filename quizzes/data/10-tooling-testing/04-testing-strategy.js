QUIZ.register({
  "id": "10-tooling-testing/04-testing-strategy",
  "section": "10-tooling-testing",
  "title": "Стратегия тестирования",
  "order": 4,
  "source": "../10-tooling-testing/04-testing-strategy.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Какой запрос Testing Library предпочтителен в первую очередь?",
      "options": [
        "`getByTestId`",
        "`getByRole`",
        "`container.querySelector`",
        "`getByClassName`"
      ],
      "answer": 1,
      "explain": "Ищите элементы так, как их находит пользователь и вспомогательные технологии."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Каких тестов больше всего в «трофее тестирования»?",
      "options": [
        "unit",
        "интеграционных",
        "e2e",
        "snapshot"
      ],
      "answer": 1,
      "explain": "Лучший баланс уверенности и стоимости."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему MSW лучше мока `fetch` через `vi.mock`?",
      "options": [
        "Быстрее",
        "Перехватывает на сетевом уровне: тест не зависит от HTTP-клиента и проверяет реальную обработку ответа",
        "Не нужен Node",
        "Так требует React"
      ],
      "answer": 1,
      "explain": "Плюс одни и те же обработчики для тестов, Storybook и dev."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Тесты проходят по одному, но падают при запуске всех. Вероятная причина?",
      "options": [
        "Медленный компьютер",
        "Общее состояние между тестами (кэш, синглтоны, обработчики MSW)",
        "Ошибка Vitest",
        "Неправильный TypeScript"
      ],
      "answer": 1,
      "explain": "Изолируйте: новый QueryClient на тест, `server.resetHandlers()` в `afterEach`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как дождаться появления текста после асинхронного запроса?",
      "options": [
        "`await sleep(1000)`",
        "`await screen.findByText(...)`",
        "`getByText` сразу",
        "`setTimeout` в тесте"
      ],
      "answer": 1,
      "explain": "`findBy*` ждёт с ретраями до таймаута."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что делает e2e-тесты на Playwright стабильными?",
      "options": [
        "Локаторы по ролям и автоожидания",
        "Подготовка данных через API, изоляция тестов",
        "`waitForTimeout(3000)` между шагами",
        "Авторизация через storageState",
        "Трассы на ретраях для разбора"
      ],
      "answer": [
        0,
        1,
        3,
        4
      ],
      "explain": "Фиксированные паузы — главный источник flaky и медленных тестов."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем Vitest Browser Mode отличается от jsdom?",
      "options": [
        "Ничем",
        "Тесты идут в настоящем браузере: раскладка, фокус, IntersectionObserver работают по-настоящему",
        "Быстрее jsdom",
        "Не поддерживает React"
      ],
      "answer": 1,
      "explain": "Ближе к реальности, но медленнее."
    }
  ],
  "tasks": [
    {
      "title": "Spy-функция (как vi.fn)",
      "level": "middle",
      "prompt": "Реализуйте `fn(impl?)`: возвращает функцию-шпиона, которая вызывает `impl` (если передана) и запоминает вызовы. Свойства: `mock.calls` (массив массивов аргументов), `mock.results` (`{ type: \"return\" | \"throw\", value }`), методы `mockReturnValue(v)` (заменяет реализацию) и `mockClear()` (очищает calls и results). Ошибка из реализации пробрасывается дальше.",
      "starter": "function fn(impl) {\n  // ваш код\n}",
      "solution": "function fn(impl) {\n  let implementation = impl;\n  const spy = function (...args) {\n    spy.mock.calls.push(args);\n    try {\n      const value = implementation ? implementation.apply(this, args) : undefined;\n      spy.mock.results.push({ type: 'return', value });\n      return value;\n    } catch (error) {\n      spy.mock.results.push({ type: 'throw', value: error });\n      throw error;\n    }\n  };\n  spy.mock = { calls: [], results: [] };\n  spy.mockReturnValue = (value) => {\n    implementation = () => value;\n    return spy;\n  };\n  spy.mockClear = () => {\n    spy.mock.calls = [];\n    spy.mock.results = [];\n    return spy;\n  };\n  return spy;\n}",
      "tests": [
        {
          "name": "вызовы",
          "code": "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b); const s = fn((a, b) => a + b); s(1, 2); s(3, 4); return eq(s.mock.calls, [[1, 2], [3, 4]]) && s.mock.results[1].value === 7;"
        },
        {
          "name": "mockReturnValue",
          "code": "const s = fn(); s.mockReturnValue(42); return s() === 42;"
        },
        {
          "name": "ошибки",
          "code": "const s = fn(() => { throw new Error(\"x\"); }); try { s(); return false; } catch (e) { return s.mock.results[0].type === \"throw\" && e.message === \"x\"; }"
        },
        {
          "name": "mockClear",
          "code": "const s = fn(); s(1); s.mockClear(); return s.mock.calls.length === 0 && s.mock.results.length === 0;"
        },
        {
          "name": "без реализации",
          "code": "return fn()(1) === undefined;"
        }
      ]
    },
    {
      "title": "waitFor с ретраями",
      "level": "senior",
      "prompt": "Реализуйте `waitFor(callback, { timeout = 1000, interval = 20 } = {})`: вызывает `callback` сразу и затем каждые `interval` мс, пока он не перестанет бросать ошибку; возвращает его результат. Если за `timeout` мс так и не получилось — отклонить промис **последней** ошибкой callback.",
      "starter": "async function waitFor(callback, { timeout = 1000, interval = 20 } = {}) {\n  // ваш код\n}",
      "solution": "async function waitFor(callback, { timeout = 1000, interval = 20 } = {}) {\n  const deadline = Date.now() + timeout;\n  for (;;) {\n    try {\n      return await callback();\n    } catch (error) {\n      if (Date.now() >= deadline) throw error;\n      await new Promise((resolve) => setTimeout(resolve, interval));\n    }\n  }\n}",
      "tests": [
        {
          "name": "дожидается",
          "code": "let ready = false; setTimeout(() => { ready = true; }, 50); const r = await waitFor(() => { if (!ready) throw new Error(\"not yet\"); return \"ok\"; }); return r === \"ok\";"
        },
        {
          "name": "таймаут с последней ошибкой",
          "code": "let n = 0; try { await waitFor(() => { n++; throw new Error(\"fail \" + n); }, { timeout: 60, interval: 10 }); return false; } catch (e) { return e.message === \"fail \" + n && n >= 3; }"
        },
        {
          "name": "сразу успешно",
          "code": "let n = 0; await waitFor(() => { n++; }); return n === 1;"
        }
      ],
      "notes": "Так устроены `waitFor` в Testing Library и автоожидания `expect.poll` в Playwright/Vitest."
    }
  ]
});
