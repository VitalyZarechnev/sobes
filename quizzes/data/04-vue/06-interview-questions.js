QUIZ.register({
  "id": "04-vue/06-interview-questions",
  "section": "04-vue",
  "title": "Vue: вопросы и практика",
  "order": 6,
  "source": "../04-vue/06-interview-questions.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Почему нельзя менять props в дочернем компоненте?",
      "options": [
        "Это медленно",
        "Однонаправленный поток данных: источник истины — родитель; для изменения — emit или defineModel",
        "Props только для чтения в TS",
        "Можно"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что произойдёт при `state = reactive({ ...newData })` вместо изменения полей?",
      "options": [
        "Всё обновится",
        "Шаблон и другие ссылки продолжат указывать на старый объект — реактивность «потеряется»",
        "Ошибка",
        "Vue сам заменит"
      ],
      "answer": 1,
      "explain": "Меняйте поля (`Object.assign(state, newData)`) или используйте `ref`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как отменить устаревший запрос в `watch`?",
      "options": [
        "Нельзя",
        "`onWatcherCleanup(() => controller.abort())` (или аргумент onCleanup)",
        "setTimeout",
        "nextTick"
      ],
      "answer": 1,
      "explain": "См. теорию темы."
    }
  ],
  "tasks": [
    {
      "title": "Мини-реактивность: ref, computed, effect",
      "level": "senior",
      "prompt": "Реализуйте упрощённую реактивность без Vue: `ref(value)` (объект с геттером/сеттером `value`), `effect(fn)` (запускает fn сразу и повторно при изменении прочитанных в нём ref; возвращает функцию остановки), `computed(getter)` (ленивое кэшированное значение `.value`, пересчитывается при изменении зависимостей). Запись того же значения (`Object.is`) не запускает эффекты.",
      "starter": "function ref(value) {}\nfunction effect(fn) {}\nfunction computed(getter) {}",
      "solution": "let activeEffect = null;\n\nfunction ref(value) {\n  const subscribers = new Set();\n  return {\n    get value() {\n      if (activeEffect) {\n        subscribers.add(activeEffect);\n        activeEffect.deps.add(subscribers);\n      }\n      return value;\n    },\n    set value(next) {\n      if (Object.is(next, value)) return;\n      value = next;\n      [...subscribers].forEach((run) => run());\n    },\n  };\n}\n\nfunction effect(fn) {\n  const run = () => {\n    run.deps.forEach((dep) => dep.delete(run)); // сбрасываем старые зависимости\n    run.deps.clear();\n    const prev = activeEffect;\n    activeEffect = run;\n    try {\n      fn();\n    } finally {\n      activeEffect = prev;\n    }\n  };\n  run.deps = new Set();\n  run();\n  return () => {\n    run.deps.forEach((dep) => dep.delete(run));\n    run.deps.clear();\n  };\n}\n\nfunction computed(getter) {\n  let cached;\n  let dirty = true;\n  const result = ref(undefined);\n  effect(() => {\n    getter(); // подписка на зависимости\n    dirty = true;\n    result.value = Symbol(); // уведомляем подписчиков computed\n  });\n  return {\n    get value() {\n      result.value; // трекинг для внешних эффектов\n      if (dirty) {\n        cached = getter();\n        dirty = false;\n      }\n      return cached;\n    },\n  };\n}",
      "tests": [
        {
          "name": "effect реагирует",
          "code": "const a = ref(1); let seen = []; effect(() => seen.push(a.value)); a.value = 2; return seen.join() === \"1,2\";"
        },
        {
          "name": "без лишних запусков",
          "code": "const a = ref(1); let n = 0; effect(() => { a.value; n++; }); a.value = 1; return n === 1;"
        },
        {
          "name": "остановка",
          "code": "const a = ref(1); let n = 0; const stop = effect(() => { a.value; n++; }); stop(); a.value = 5; return n === 1;"
        },
        {
          "name": "computed кэширует",
          "code": "const a = ref(2); let calls = 0; const d = computed(() => { calls++; return a.value * 2; }); const before = calls; d.value; d.value; return d.value === 4 && calls - before <= 1;"
        },
        {
          "name": "computed в effect",
          "code": "const a = ref(1); const d = computed(() => a.value + 1); let seen = []; effect(() => seen.push(d.value)); a.value = 10; return seen.at(-1) === 11;"
        },
        {
          "name": "динамические зависимости",
          "code": "const flag = ref(true); const a = ref(\"a\"); const b = ref(\"b\"); let n = 0; effect(() => { n++; flag.value ? a.value : b.value; }); flag.value = false; const after = n; a.value = \"A\"; return n === after;"
        }
      ],
      "notes": "Во Vue реактивность устроена на Proxy с WeakMap target → key → deps и планировщиком (батчинг до nextTick); с 3.6 — на alien-signals."
    }
  ]
});
