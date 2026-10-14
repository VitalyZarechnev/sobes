QUIZ.register({
  "id": "03-react/02-hooks-deep-dive",
  "section": "03-react",
  "title": "Хуки: глубокое погружение",
  "order": 2,
  "source": "../03-react/02-hooks-deep-dive.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Счётчик увеличится на сколько после одного клика?",
      "code": "const onClick = () => {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n};",
      "options": [
        "на 3",
        "на 1",
        "на 0",
        "ошибка"
      ],
      "answer": 1,
      "explain": "Все три вызова видят одно и то же `count` из замыкания. Для +3 — `setCount((c) => c + 1)`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое «устаревшее замыкание» (stale closure) в эффекте?",
      "options": [
        "Ошибка сборки",
        "Колбэк (таймер, подписка) захватил значения из старого рендера и не видит новые",
        "Утечка памяти",
        "Ошибка гидратации"
      ],
      "answer": 1,
      "explain": "Решения: зависимости эффекта, функциональные обновления, `useEffectEvent` (React 19.2)."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Для чего `useEffectEvent`?",
      "options": [
        "Замена useEffect",
        "Обработчик внутри эффекта, который видит актуальные пропсы/состояние, но не является его зависимостью",
        "Для событий DOM",
        "Для серверных эффектов"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему эффект в dev запускается дважды?",
      "options": [
        "Баг React",
        "StrictMode монтирует, размонтирует и монтирует снова, чтобы выявить отсутствие очистки",
        "Из-за HMR",
        "Из-за двух вызовов root.render"
      ],
      "answer": 1,
      "explain": "В продакшене — один раз."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Когда `useLayoutEffect` вместо `useEffect`?",
      "options": [
        "Для запросов",
        "Когда нужно измерить DOM и синхронно изменить его до отрисовки (без мигания)",
        "Всегда",
        "Для SSR"
      ],
      "answer": 1,
      "explain": "Блокирует отрисовку — используйте точечно."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `useSyncExternalStore`?",
      "options": [
        "Синхронизирует state с сервером",
        "Безопасно подписывает компонент на внешний стор без «разрывов» (tearing) в конкурентном рендере",
        "Заменяет контекст",
        "Для форм"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Зачем `useId`?",
      "options": [
        "Для key в списках",
        "Стабильный уникальный id, совпадающий на сервере и клиенте (связь label и input, aria-атрибуты)",
        "Для генерации UUID в БД",
        "Для рефов"
      ],
      "answer": 1,
      "explain": "Не используйте его как key."
    }
  ],
  "tasks": [
    {
      "title": "Мини-реализация useState",
      "level": "senior",
      "prompt": "Смоделируйте механизм хуков: `createComponent(render)` → `{ rerender() }`. Внутри `render` можно вызывать переданный `useState(initial)` (в аргументе `render({ useState })`), который хранит состояния в массиве по порядку вызова. Сеттер принимает значение или функцию `prev => next` и синхронно вызывает `rerender`, если значение изменилось (`Object.is`). `rerender()` возвращает результат `render`. Первый рендер — при создании.",
      "starter": "function createComponent(render) {\n  // ваш код\n}",
      "solution": "function createComponent(render) {\n  const states = [];\n  let cursor = 0;\n  let output;\n  const useState = (initial) => {\n    const index = cursor++;\n    if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;\n    const setState = (next) => {\n      const value = typeof next === 'function' ? next(states[index]) : next;\n      if (Object.is(value, states[index])) return;\n      states[index] = value;\n      api.rerender();\n    };\n    return [states[index], setState];\n  };\n  const api = {\n    rerender() {\n      cursor = 0; // порядок вызовов — ключ к состоянию\n      output = render({ useState });\n      return output;\n    },\n    get output() {\n      return output;\n    },\n  };\n  api.rerender();\n  return api;\n}",
      "tests": [
        {
          "name": "состояние между рендерами",
          "code": "let set; const c = createComponent(({ useState }) => { const [n, setN] = useState(0); set = setN; return n; }); set(5); return c.output === 5;"
        },
        {
          "name": "функциональное обновление",
          "code": "let set; const c = createComponent(({ useState }) => { const [n, setN] = useState(1); set = setN; return n; }); set((x) => x + 1); set((x) => x + 1); return c.output === 3;"
        },
        {
          "name": "несколько хуков по порядку",
          "code": "let setB; const c = createComponent(({ useState }) => { const [a] = useState(\"a\"); const [b, sb] = useState(\"b\"); setB = sb; return a + b; }); setB(\"B\"); return c.output === \"aB\";"
        },
        {
          "name": "без лишнего рендера",
          "code": "let renders = 0, set; createComponent(({ useState }) => { renders++; const [n, s] = useState(1); set = s; return n; }); set(1); return renders === 1;"
        },
        {
          "name": "ленивая инициализация",
          "code": "let calls = 0; const c = createComponent(({ useState }) => { const [v] = useState(() => { calls++; return 42; }); return v; }); c.rerender(); return c.output === 42 && calls === 1;"
        }
      ],
      "notes": "Именно поэтому хуки нельзя вызывать в условиях: индекс сдвинется и состояние «перепутается»."
    }
  ]
});
