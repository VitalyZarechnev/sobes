QUIZ.register({
  "id": "03-react/11-whats-new",
  "section": "03-react",
  "title": "Новинки React 19.x и React Compiler",
  "order": 11,
  "source": "../03-react/11-whats-new.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что возвращает `useActionState(action, initial)`?",
      "options": [
        "`[state, setState]`",
        "`[state, formAction, isPending]`",
        "`{ pending, data }`",
        "промис"
      ],
      "answer": 1,
      "explain": "State — результат последнего вызова action, formAction передаётся в `<form action>`, isPending — флаг выполнения."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Откуда `useFormStatus()` берёт статус?",
      "options": [
        "Из ближайшего контекста-провайдера",
        "Из ближайшей родительской `<form>`",
        "Из глобального стора",
        "Из пропсов"
      ],
      "answer": 1,
      "explain": "Поэтому кнопку отправки можно вынести в отдельный компонент без проброса `isPending`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Чем `use()` отличается от остальных хуков?",
      "options": [
        "Его можно вызывать условно и в циклах; читает промис (с Suspense) или контекст",
        "Он работает только в Server Components",
        "Он заменяет useEffect",
        "Ничем"
      ],
      "answer": 0,
      "explain": "Промис должен быть стабильным (создан вне рендера), иначе бесконечная приостановка."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Что изменилось в React 19?",
      "options": [
        "`ref` — обычный проп, `forwardRef` не нужен",
        "`<Context value>` вместо `<Context.Provider>`",
        "`<title>` и `<meta>` из компонентов поднимаются в `<head>`",
        "Удалены хуки useEffect и useState",
        "`propTypes` у функциональных компонентов больше не работают"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Хуки, конечно, остались."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает React Compiler?",
      "options": [
        "Компилирует JSX в нативный код",
        "Автоматически мемоизирует значения, колбэки и JSX, анализируя компоненты при сборке",
        "Переводит классы в функции",
        "Удаляет неиспользуемые компоненты"
      ],
      "answer": 1,
      "explain": "Работает для кода, соблюдающего правила React; нарушающие компоненты пропускает. Стабильная 1.0 — октябрь 2025."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Зачем `<Activity mode=\"hidden\">`, если есть условный рендер?",
      "options": [
        "Это одно и то же",
        "Сохраняет состояние и DOM скрытой части, но размонтирует её эффекты и откладывает обновления",
        "Удаляет компонент из памяти",
        "Ускоряет первый рендер"
      ],
      "answer": 1,
      "explain": "Условный рендер теряет состояние, `display: none` оставляет работающие эффекты."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какую проблему решает `useEffectEvent`?",
      "options": [
        "Подписку на события DOM",
        "Позволяет читать свежие пропсы/state внутри эффекта, не делая их зависимостями и не перезапуская эффект",
        "Замену useCallback",
        "Обработку ошибок в эффектах"
      ],
      "answer": 1,
      "explain": "Пример: эффект переподключается только при смене `roomId`, а уведомление использует актуальную `theme`."
    },
    {
      "type": "output",
      "level": "senior",
      "q": "Что увидит пользователь?",
      "code": "const [count, addOptimistic] = useOptimistic(5, (c, d) => c + d);\n// в action: addOptimistic(1); await saveLike(); — запрос упал с ошибкой",
      "lang": "jsx",
      "options": [
        "6, затем 6",
        "6, затем 5",
        "5 всё время",
        "6, затем 7"
      ],
      "answer": 1,
      "explain": "Оптимистичное значение живёт только пока выполняется action, затем React возвращается к реальному state."
    },
    {
      "type": "single",
      "level": "lead",
      "q": "Что показал инцидент CVE-2025-55182 (декабрь 2025)?",
      "options": [
        "XSS в React DOM",
        "Неаутентифицированное RCE через эндпоинт Server Functions (CVSS 10.0): RSC — серверная поверхность атаки, нужен процесс быстрых обновлений",
        "Утечку памяти в useEffect",
        "Уязвимость в React Native"
      ],
      "answer": 1,
      "explain": "Затронуты фреймворки с RSC (Next.js и др.). Исправлено в 19.0.1, 19.1.2, 19.2.1."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что даёт `<ViewTransition>` в React 19.3?",
      "options": [
        "Роутинг между страницами",
        "Анимации появления, исчезновения и перемещения элементов поверх View Transitions API для обновлений в transition",
        "Ленивую загрузку компонентов",
        "Переходы между темами"
      ],
      "answer": 1,
      "explain": "С `addTransitionType` можно выбирать анимацию по причине перехода."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое Fragment refs (19.3)?",
      "options": [
        "ref на массив детей",
        "`ref` у `<Fragment>` даёт FragmentInstance для работы с группой соседних DOM-узлов без обёртки",
        "Синоним useRef",
        "ref на виртуальный DOM"
      ],
      "answer": 1,
      "explain": "Методы: `addEventListener`, `focus`, `observeUsing`, `getClientRects`, `scrollIntoView` и др."
    },
    {
      "type": "open",
      "level": "lead",
      "q": "Как бы вы внедряли React Compiler в большое приложение?",
      "answer": "Обновить `eslint-plugin-react-hooks` до v6+ и включить правила на базе компилятора; исправить нарушения правил React (мутации props/state, побочные эффекты в рендере). Включить компилятор сначала на части кода (директория или opt-in `\"use memo\"`), сравнить профили (React DevTools, Performance Tracks), Web Vitals и размер бандла. Затем расширить на всё приложение и постепенно удалять ручную мемоизацию там, где она не нужна для внешних API. Следить за ошибками в проде, иметь возможность отключить через конфиг."
    }
  ],
  "tasks": [
    {
      "title": "Форма на useActionState",
      "level": "senior",
      "lang": "jsx",
      "prompt": "Перепишите форму подписки с тремя useState (email, loading, error) и onSubmit на `useActionState` + `<form action>`. Ошибку показывайте в `role=\"alert\"`.",
      "solution": "function Subscribe() {\n  const [error, formAction, isPending] = useActionState(async (_prev, formData) => {\n    try {\n      await subscribe(formData.get('email'));\n      return null;\n    } catch (err) {\n      return err.message;\n    }\n  }, null);\n\n  return (\n    <form action={formAction}>\n      <input name=\"email\" type=\"email\" required />\n      <button disabled={isPending}>Подписаться</button>\n      {error && <p role=\"alert\">{error}</p>}\n    </form>\n  );\n}"
    },
    {
      "title": "useEffectEvent для WebSocket",
      "level": "senior",
      "lang": "jsx",
      "prompt": "Хук `useChannel(channelId, onMessage)` переподключает сокет на каждый рендер родителя, потому что `onMessage` в зависимостях. Исправьте с помощью `useEffectEvent`.",
      "solution": "function useChannel(channelId, onMessage) {\n  const handleMessage = useEffectEvent((msg) => onMessage(msg));\n  useEffect(() => {\n    const socket = connect(channelId);\n    socket.addEventListener('message', (e) => handleMessage(JSON.parse(e.data)));\n    return () => socket.close();\n  }, [channelId]);\n}"
    }
  ]
});
