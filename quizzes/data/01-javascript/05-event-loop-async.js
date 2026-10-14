QUIZ.register({
  "id": "01-javascript/05-event-loop-async",
  "section": "01-javascript",
  "title": "Event loop и асинхронность",
  "order": 5,
  "source": "../01-javascript/05-event-loop-async.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что выведет код?",
      "code": "console.log('a');\nsetTimeout(() => console.log('b'), 0);\nqueueMicrotask(() => console.log('c'));\nPromise.resolve().then(() => console.log('d'));\nconsole.log('e');",
      "options": [
        "`a e c d b`",
        "`a b c d e`",
        "`a e b c d`",
        "`a e d c b`"
      ],
      "answer": 0,
      "explain": "Синхронный код, затем микрозадачи в порядке постановки, затем таймер."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "async function f() {\n  console.log(1);\n  await null;\n  console.log(2);\n}\nf();\nconsole.log(3);",
      "options": [
        "`1 2 3`",
        "`1 3 2`",
        "`3 1 2`",
        "`1 3`"
      ],
      "answer": 1,
      "explain": "Код до первого `await` синхронный, остаток — микрозадачей."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "setTimeout(() => console.log('t1'));\nPromise.resolve().then(() => {\n  console.log('p1');\n  setTimeout(() => console.log('t2'));\n  Promise.resolve().then(() => console.log('p2'));\n});",
      "options": [
        "`p1 p2 t1 t2`",
        "`p1 t1 p2 t2`",
        "`t1 p1 p2 t2`",
        "`p1 t1 t2 p2`"
      ],
      "answer": 0,
      "explain": "Очередь микрозадач опустошается полностью, включая добавленные по ходу, до следующей макрозадачи."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает `Promise.allSettled`?",
      "options": [
        "Отклоняется на первой ошибке",
        "Ждёт все промисы и возвращает статусы `fulfilled`/`rejected`",
        "Возвращает первый успешный",
        "Отменяет остальные"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему бесконечная цепочка микрозадач «замораживает» страницу?",
      "options": [
        "Браузер её игнорирует",
        "Рендер и макрозадачи не выполнятся, пока очередь микрозадач не пуста",
        "Микрозадачи выполняются в воркере",
        "Не замораживает"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как отменить fetch?",
      "options": [
        "`promise.cancel()`",
        "`AbortController`: передать `signal` и вызвать `abort()`",
        "Удалить переменную",
        "Нельзя"
      ],
      "answer": 1,
      "explain": "`AbortSignal.timeout(ms)` и `AbortSignal.any([...])` — для таймаутов и комбинаций."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что выведет код?",
      "code": "const p = Promise.reject(new Error('x'));\np.catch(() => console.log('caught'));\np.then(() => console.log('ok')).catch(() => console.log('caught2'));",
      "options": [
        "`caught`",
        "`caught caught2`",
        "`ok`",
        "unhandled rejection"
      ],
      "answer": 1,
      "explain": "Каждая цепочка обрабатывает отклонение независимо."
    }
  ],
  "tasks": [
    {
      "title": "Promise.all своими руками",
      "level": "senior",
      "prompt": "Реализуйте `promiseAll(iterable)`: возвращает промис массива результатов в исходном порядке; отклоняется первой ошибкой; не-промисы трактуются как выполненные значения; пустой вход — `[]`.",
      "starter": "function promiseAll(iterable) {\n  // ваш код\n}",
      "solution": "function promiseAll(iterable) {\n  return new Promise((resolve, reject) => {\n    const items = [...iterable];\n    const results = new Array(items.length);\n    let left = items.length;\n    if (left === 0) return resolve(results);\n    items.forEach((item, i) => {\n      Promise.resolve(item).then((value) => {\n        results[i] = value;\n        if (--left === 0) resolve(results);\n      }, reject);\n    });\n  });\n}",
      "tests": [
        {
          "name": "порядок",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const r = await promiseAll([sleep(20).then(() => 1), 2, Promise.resolve(3)]); return r.join() === \"1,2,3\";"
        },
        {
          "name": "ошибка",
          "code": "try { await promiseAll([Promise.resolve(1), Promise.reject(new Error(\"boom\"))]); return false; } catch (e) { return e.message === \"boom\"; }"
        },
        {
          "name": "пустой",
          "code": "const r = await promiseAll([]); return Array.isArray(r) && r.length === 0;"
        }
      ]
    },
    {
      "title": "Таймаут для промиса",
      "level": "senior",
      "prompt": "Реализуйте `withTimeout(promise, ms)`: отклоняется ошибкой с `name === \"TimeoutError\"`, если промис не завершился за `ms`; иначе — его результат. Таймер должен очищаться после завершения.",
      "starter": "function withTimeout(promise, ms) {\n  // ваш код\n}",
      "solution": "function withTimeout(promise, ms) {\n  let timer;\n  const timeout = new Promise((_, reject) => {\n    timer = setTimeout(() => {\n      const error = new Error(`Timeout after ${ms} ms`);\n      error.name = 'TimeoutError';\n      reject(error);\n    }, ms);\n  });\n  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));\n}",
      "tests": [
        {
          "name": "успел",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); return (await withTimeout(sleep(10).then(() => \"ok\"), 100)) === \"ok\";"
        },
        {
          "name": "не успел",
          "code": "const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); try { await withTimeout(sleep(100), 20); return false; } catch (e) { return e.name === \"TimeoutError\"; }"
        },
        {
          "name": "ошибка промиса",
          "code": "try { await withTimeout(Promise.reject(new Error(\"x\")), 50); return false; } catch (e) { return e.message === \"x\"; }"
        }
      ]
    }
  ]
});
