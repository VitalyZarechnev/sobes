QUIZ.register({
  "id": "04-vue/08-state-managers",
  "section": "04-vue",
  "title": "Стейт-менеджеры во Vue",
  "order": 8,
  "source": "../04-vue/08-state-managers.md",
  "questions": [
    {
      "type": "output",
      "level": "middle",
      "q": "Что будет на экране после клика по кнопке?",
      "code": "<script setup>\nconst cart = useCartStore(); // state: { count: 0 }\nconst { count } = cart;\n</script>\n<template>\n  <button @click=\"cart.count++\">{{ count }}</button>\n</template>",
      "options": [
        "`1`",
        "`0` — деструктуризация скопировала значение",
        "ошибка",
        "`NaN`"
      ],
      "answer": 1,
      "explain": "Нужно `const { count } = storeToRefs(cart)`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему модульный `const user = ref(null)` опасен в Nuxt (SSR)?",
      "options": [
        "Медленно",
        "Состояние модуля общее для всех запросов процесса — данные одного пользователя утекут другому",
        "Не работает реактивность",
        "Нельзя импортировать"
      ],
      "answer": 1,
      "explain": "Используйте `useState` или Pinia."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Где хранить список заказов с сервера?",
      "options": [
        "В Pinia с ручной синхронизацией",
        "В серверном кэше: Pinia Colada / TanStack Vue Query / useFetch с ключом",
        "В localStorage",
        "В provide на корне"
      ],
      "answer": 1,
      "explain": "Кэш, дедупликация, инвалидация и фоновое обновление уже решены."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "На странице два независимых визарда. Как делить состояние шагов?",
      "options": [
        "Один глобальный Pinia-стор",
        "provide/inject в корне каждого визарда",
        "Модульный ref",
        "URL"
      ],
      "answer": 1,
      "explain": "Состояние принадлежит поддереву, а не приложению."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "В setup-сторе Pinia забыли вернуть `ref` из функции. Что будет?",
      "options": [
        "Ничего",
        "Состояние не попадёт в devtools и SSR-сериализацию и может вести себя как приватное",
        "Ошибка компиляции",
        "Стор станет options-стором"
      ],
      "answer": 1,
      "explain": "Всё состояние setup-стора нужно возвращать."
    },
    {
      "type": "multi",
      "level": "middle",
      "q": "Чем Pinia отличается от Vuex?",
      "options": [
        "нет мутаций",
        "полная типизация без обёрток",
        "независимые сторы вместо вложенных модулей",
        "обязательны namespaces",
        "setup-стиль на Composition API"
      ],
      "answer": [
        0,
        1,
        2,
        4
      ],
      "explain": "Namespaces — особенность Vuex."
    }
  ],
  "tasks": [
    {
      "title": "Мини-стор с подписками",
      "level": "senior",
      "prompt": "Реализуйте без Vue `defineMiniStore(setup)` → `useStore()`: `setup()` вызывается **один раз** при первом `useStore()` и возвращает объект состояния и действий; `useStore()` всегда возвращает тот же экземпляр. Добавьте к экземпляру `$subscribe(fn)` (возвращает функцию отписки) и `$patch(partial)` (поверхностное слияние полей состояния и вызов подписчиков с копией нового состояния). Состояние — все поля, кроме функций.",
      "starter": "function defineMiniStore(setup) {\n  // ваш код\n}",
      "solution": "function defineMiniStore(setup) {\n  let instance = null;\n  return function useStore() {\n    if (instance) return instance;\n    const listeners = new Set();\n    const store = setup();\n    const snapshot = () => Object.fromEntries(Object.entries(store).filter(([, v]) => typeof v !== 'function'));\n    store.$subscribe = (fn) => {\n      listeners.add(fn);\n      return () => listeners.delete(fn);\n    };\n    store.$patch = (partial) => {\n      Object.assign(store, partial);\n      const state = snapshot();\n      listeners.forEach((fn) => fn(state));\n    };\n    instance = store;\n    return instance;\n  };\n}",
      "tests": [
        {
          "name": "синглтон и ленивый setup",
          "code": "let calls = 0; const use = defineMiniStore(() => { calls++; return { count: 0 }; }); const a = use(); const b = use(); return a === b && calls === 1;"
        },
        {
          "name": "$patch и подписка",
          "code": "const use = defineMiniStore(() => ({ count: 0, name: \"x\", inc() {} })); const s = use(); const seen = []; s.$subscribe((st) => seen.push(st)); s.$patch({ count: 5 }); return s.count === 5 && seen.length === 1 && seen[0].count === 5 && !(\"inc\" in seen[0]);"
        },
        {
          "name": "отписка",
          "code": "const use = defineMiniStore(() => ({ v: 1 })); const s = use(); let n = 0; const off = s.$subscribe(() => n++); off(); s.$patch({ v: 2 }); return n === 0;"
        }
      ],
      "notes": "Pinia дополнительно делает состояние реактивным, создаёт экземпляр на каждое приложение (SSR) и интегрируется с devtools."
    }
  ]
});
