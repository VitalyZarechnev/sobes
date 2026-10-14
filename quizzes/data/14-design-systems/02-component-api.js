QUIZ.register({
  "id": "14-design-systems/02-component-api",
  "section": "14-design-systems",
  "title": "API компонентов",
  "order": 2,
  "source": "../14-design-systems/02-component-api.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что лучше вместо `isPrimary`, `isGhost`, `isDanger`?",
      "options": [
        "Ещё один флаг `isDefault`",
        "Union-проп `variant: \"primary\" | \"ghost\" | \"danger\"`",
        "Проп `className`",
        "Отдельные компоненты на каждую комбинацию"
      ],
      "answer": 1,
      "explain": "Взаимоисключающие флаги допускают невозможные комбинации."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как compound components (`Tabs.List`, `Tabs.Trigger`) делят состояние?",
      "options": [
        "Через глобальный стор",
        "Через контекст родительского компонента",
        "Через props drilling",
        "Через DOM-атрибуты"
      ],
      "answer": 1,
      "explain": "Пользователь управляет структурой, состояние скрыто внутри."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Что делает `asChild` в Radix?",
      "options": [
        "Рендерит детей дважды",
        "Сливает пропсы, поведение и ref компонента с единственным ребёнком вместо своего элемента",
        "Делает компонент дочерним в порталe",
        "Отключает стили"
      ],
      "answer": 1,
      "explain": "Удобно с `Link` роутера и сторонними компонентами."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Какое соглашение для controlled/uncontrolled режима?",
      "options": [
        "`value` + `defaultValue` + `onValueChange`",
        "только `value`",
        "только `ref`",
        "`state` + `setState` в пропсах"
      ],
      "answer": 0,
      "explain": "Как у нативных элементов форм."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие изменения API компонента обратно совместимы?",
      "options": [
        "новый необязательный проп",
        "новый вариант в union",
        "переименование пропа",
        "изменение значения по умолчанию",
        "новый подкомпонент compound-набора"
      ],
      "answer": [
        0,
        1,
        4
      ],
      "explain": "Переименование и смена дефолтов — breaking."
    }
  ],
  "tasks": [
    {
      "title": "createControllableState",
      "level": "senior",
      "prompt": "Реализуйте без React `createControllableState({ value, defaultValue, onChange })` → `{ get(), set(next), update(props) }`. Если `value !== undefined` — режим controlled: `get()` возвращает `value` из последних props, `set` только вызывает `onChange`. Иначе — uncontrolled: `set` меняет внутреннее значение и вызывает `onChange`. `update(props)` передаёт новые props (как ререндер). `onChange` не вызывается, если значение не изменилось (`Object.is`).",
      "starter": "function createControllableState(props) {\n  // ваш код\n}",
      "solution": "function createControllableState(props) {\n  let current = props;\n  let inner = props.defaultValue;\n  const isControlled = () => current.value !== undefined;\n  const get = () => (isControlled() ? current.value : inner);\n  return {\n    get,\n    set(next) {\n      if (Object.is(next, get())) return;\n      if (!isControlled()) inner = next;\n      current.onChange?.(next);\n    },\n    update(nextProps) {\n      current = nextProps;\n    },\n  };\n}",
      "tests": [
        {
          "name": "uncontrolled",
          "code": "const calls = []; const s = createControllableState({ defaultValue: 1, onChange: (v) => calls.push(v) }); s.set(2); return s.get() === 2 && calls.join() === \"2\";"
        },
        {
          "name": "controlled не меняется сам",
          "code": "const calls = []; const s = createControllableState({ value: 1, onChange: (v) => calls.push(v) }); s.set(5); return s.get() === 1 && calls.join() === \"5\";"
        },
        {
          "name": "controlled после update",
          "code": "const s = createControllableState({ value: 1 }); s.update({ value: 7 }); return s.get() === 7;"
        },
        {
          "name": "без лишних onChange",
          "code": "let n = 0; const s = createControllableState({ defaultValue: \"a\", onChange: () => n++ }); s.set(\"a\"); return n === 0;"
        }
      ]
    }
  ]
});
