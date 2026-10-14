# Доступные компоненты

> ⏱ ~3 ч · 🎯 Сделать доступность свойством библиотеки компонентов: паттерны WAI-ARIA, управление фокусом, нативные элементы, автоматические и ручные проверки.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Знаю «первое правило ARIA» и когда нативный элемент лучше
- [ ] Реализую клавиатурную навигацию: roving tabindex, стрелки, Escape
- [ ] Управляю фокусом в диалогах и поповерах (ловушка, возврат, `inert`)
- [ ] Использую `<dialog>` и Popover API там, где это уместно
- [ ] Настроил axe в тестах и Storybook, тестировал со скринридером
- [ ] Ответил вслух на вопросы ниже

## Теория

### Принципы

- **Нативное прежде всего.** `<button>`, `<a href>`, `<input>`, `<select>`, `<dialog>`, `<details>` дают фокус, клавиатуру, роли и состояния бесплатно. Первое правило ARIA: не используйте ARIA, если есть нативный элемент.
- **Имя, роль, значение.** У каждого интерактивного элемента — доступное имя (`<label>`, текст, `aria-label`/`aria-labelledby`), роль и актуальные состояния (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-invalid`).
- **Клавиатура.** Всё, что работает мышью, работает с клавиатуры; порядок фокуса логичен; фокус всегда виден (`:focus-visible`).
- **Не ломать то, что работает.** `div` с `role="button"` требует `tabindex="0"`, обработки Enter и Space — проще взять `<button>`.

### Паттерны WAI-ARIA APG

Для сложных виджетов есть эталонные паттерны с клавиатурой и ролями: Combobox, Listbox, Menu/Menubar, Tabs, Tree, Grid, Dialog, Disclosure, Accordion, Tooltip, Slider, Toolbar.

```tsx
// Tabs: стрелки переключают вкладки, Tab уходит в панель (roving tabindex)
<div role="tablist" aria-label="Настройки">
  {tabs.map((tab, i) => (
    <button
      key={tab.id}
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={i === active}
      aria-controls={`panel-${tab.id}`}
      tabIndex={i === active ? 0 : -1} // в порядке Tab только активная вкладка
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') focusTab((i + 1) % tabs.length);
        if (e.key === 'ArrowLeft') focusTab((i - 1 + tabs.length) % tabs.length);
        if (e.key === 'Home') focusTab(0);
        if (e.key === 'End') focusTab(tabs.length - 1);
      }}
      onClick={() => setActive(i)}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Управление фокусом в оверлеях

Модальный диалог:
1. При открытии — фокус на первый осмысленный элемент (или заголовок).
2. Фон недоступен: `inert` на остальной странице (нативный `<dialog>` с `showModal()` делает это сам).
3. Escape закрывает; клик по подложке — по решению дизайна.
4. При закрытии — фокус возвращается на элемент, который открыл диалог.
5. `aria-labelledby` на заголовок, `aria-describedby` — на описание.

Поповеры и меню — Popover API (`popover`, `popovertarget`) даёт верхний слой, light dismiss и Escape; позиционирование — CSS Anchor Positioning или Floating UI. См. [новинки HTML](../06-web-platform/09-whats-new-html.md) и [CSS](../06-web-platform/08-whats-new-css.md).

### Живые области

Toast-уведомления, результаты поиска, ошибки отправки — через `aria-live="polite"` (или `role="status"`), критичные — `role="alert"`. Область должна существовать в DOM до появления текста, иначе скринридер её не заметит.

### Чего избегать

- `aria-label` на элементе с видимым текстом, который говорит другое (нарушает «Label in Name» — голосовое управление не найдёт кнопку).
- `tabindex` > 0 — ломает порядок фокуса.
- `outline: none` без замены.
- Иконочные кнопки без имени.
- Цвет как единственный носитель смысла (ошибка только красным).
- Отключённые кнопки без объяснения (лучше оставить активной и показать ошибки).
- Анимации без учёта `prefers-reduced-motion`.

### Проверка

| Что | Инструмент |
|---|---|
| Автоматические нарушения (~30–40% проблем) | axe-core: `jest-axe`/`vitest-axe`, Storybook a11y addon, `@axe-core/playwright` |
| Линтинг | eslint-plugin-jsx-a11y, eslint-plugin-vuejs-accessibility |
| Дерево доступности | DevTools → Accessibility, Firefox Accessibility Inspector |
| Клавиатура | пройти сценарий только Tab/Shift+Tab/стрелками/Enter/Escape |
| Скринридеры | VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android) |
| Масштаб | 200–400% и reflow на 320 CSS px, увеличенный шрифт |

Definition of Done компонента: проходит axe, работает с клавиатуры, проверен в одном скринридере, есть документация по клавиатурному поведению.

## Вопросы с собеседований

<details><summary>Как подойти к созданию доступной библиотеки компонентов с нуля?</summary>

Брать за основу нативные элементы и headless-примитивы (React Aria, Radix, Ark UI), которые уже реализуют паттерны APG и протестированы со скринридерами. Доступность — часть DoD: контраст в токенах, видимый фокус, клавиатура, имена и состояния, `prefers-reduced-motion`. Автоматические проверки в тестах и Storybook плюс ручное тестирование и документация клавиатурного поведения.
</details>

<details><summary>Как сделать модальное окно доступным?</summary>

`<dialog>` + `showModal()` (или эквивалент): роль и `aria-modal`, имя через `aria-labelledby`, фокус внутрь при открытии и возврат при закрытии, недоступный фон (`inert`), Escape, блокировка прокрутки фона, видимая кнопка закрытия с именем.
</details>

<details><summary>Что такое roving tabindex?</summary>

В составном виджете (вкладки, тулбар, меню, грид) только один элемент имеет `tabindex="0"`, остальные — `-1`. Tab входит и выходит из виджета одним нажатием, а перемещение внутри — стрелками. Альтернатива — `aria-activedescendant`, когда фокус остаётся на контейнере (combobox).
</details>

<details><summary>Почему автоматических проверок недостаточно?</summary>

axe находит только формально проверяемые проблемы (контраст, отсутствие имени, неверные роли). Логичность порядка фокуса, понятность имён, корректность объявлений скринридера и работу клавиатурных паттернов проверяет только человек.
</details>

## Практика

1. Реализуйте доступные Tabs по паттерну APG и проверьте с VoiceOver или NVDA.
2. Сделайте модальное окно на `<dialog>` с возвратом фокуса и проверьте axe.
3. Подключите `@axe-core/playwright` к e2e-тесту ключевой страницы.

Тест темы: [Доступные компоненты](../quizzes/quiz.html?id=14-design-systems/03-accessible-components).

## Источники
- [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [MDN: The dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [axe-core](https://github.com/dequelabs/axe-core)
- [React Aria: Accessibility](https://react-spectrum.adobe.com/react-aria/accessibility.html)
