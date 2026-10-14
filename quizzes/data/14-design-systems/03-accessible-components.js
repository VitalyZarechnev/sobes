QUIZ.register({
  "id": "14-design-systems/03-accessible-components",
  "section": "14-design-systems",
  "title": "Доступные компоненты",
  "order": 3,
  "source": "../14-design-systems/03-accessible-components.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Первое правило ARIA?",
      "options": [
        "Всегда добавлять `role`",
        "Не использовать ARIA, если есть нативный элемент с нужной семантикой",
        "Каждому элементу — `aria-label`",
        "ARIA только для скринридеров iOS"
      ],
      "answer": 1,
      "explain": "`<button>` лучше `div role=\"button\"`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что такое roving tabindex?",
      "options": [
        "`tabindex` > 0 у всех элементов",
        "В составном виджете только активный элемент имеет `tabindex=\"0\"`, остальные `-1`, перемещение — стрелками",
        "Автоматический фокус при наведении",
        "Отключение Tab"
      ],
      "answer": 1,
      "explain": "Tab входит и выходит из виджета одним нажатием."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Что нужно модальному диалогу?",
      "options": [
        "Фокус внутрь при открытии",
        "Возврат фокуса при закрытии",
        "Недоступный фон (`inert`)",
        "Escape закрывает",
        "`tabindex=\"5\"` на кнопке закрытия"
      ],
      "answer": [
        0,
        1,
        2,
        3
      ],
      "explain": "Положительный tabindex ломает порядок."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему toast с `aria-live`, добавленный в DOM вместе с текстом, может не озвучиться?",
      "options": [
        "Скринридеры не поддерживают aria-live",
        "Live-область должна существовать в DOM до изменения содержимого",
        "Нужен `role=\"button\"`",
        "Нужен `tabindex`"
      ],
      "answer": 1,
      "explain": "Скринридер следит за изменениями уже известной области."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Какую долю проблем доступности находят автоматические инструменты (axe)?",
      "options": [
        "~100%",
        "~30–40%",
        "0%",
        "~90%"
      ],
      "answer": 1,
      "explain": "Остальное — ручная проверка клавиатурой и скринридером."
    }
  ],
  "tasks": [
    {
      "title": "Клавиатурная навигация по вкладкам",
      "level": "middle",
      "prompt": "Реализуйте `nextTabIndex(key, current, count, disabled = [])` для паттерна Tabs: `ArrowRight`/`ArrowLeft` — следующая/предыдущая с зацикливанием, `Home`/`End` — первая/последняя; отключённые индексы пропускаются. Другие клавиши — `current`. Если все отключены — `current`.",
      "starter": "function nextTabIndex(key, current, count, disabled = []) {\n  // ваш код\n}",
      "solution": "function nextTabIndex(key, current, count, disabled = []) {\n  const isEnabled = (i) => !disabled.includes(i);\n  const step = (from, dir) => {\n    for (let k = 1; k <= count; k++) {\n      const i = (((from + dir * k) % count) + count) % count;\n      if (isEnabled(i)) return i;\n    }\n    return current;\n  };\n  switch (key) {\n    case 'ArrowRight': return step(current, 1);\n    case 'ArrowLeft': return step(current, -1);\n    case 'Home': return step(-1, 1);\n    case 'End': return step(count, -1);\n    default: return current;\n  }\n}",
      "tests": [
        {
          "name": "вправо и зацикливание",
          "code": "return nextTabIndex(\"ArrowRight\", 0, 3) === 1 && nextTabIndex(\"ArrowRight\", 2, 3) === 0;"
        },
        {
          "name": "влево",
          "code": "return nextTabIndex(\"ArrowLeft\", 0, 3) === 2;"
        },
        {
          "name": "Home/End",
          "code": "return nextTabIndex(\"Home\", 2, 4) === 0 && nextTabIndex(\"End\", 0, 4) === 3;"
        },
        {
          "name": "пропуск disabled",
          "code": "return nextTabIndex(\"ArrowRight\", 0, 4, [1, 2]) === 3 && nextTabIndex(\"Home\", 3, 4, [0]) === 1;"
        },
        {
          "name": "другие клавиши",
          "code": "return nextTabIndex(\"Tab\", 1, 3) === 1;"
        }
      ]
    }
  ]
});
