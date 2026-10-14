# Storybook, документация, версионирование

> ⏱ ~2 ч · 🎯 Сделать так, чтобы библиотекой компонентов было удобно пользоваться и безопасно обновляться: живая документация, тесты на сторис, semver, changelog, deprecation, codemods.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Пишу сторис в формате CSF и использую их как тесты (interaction, a11y, визуальные)
- [ ] Знаю, что должно быть в документации компонента
- [ ] Понимаю semver для UI-библиотеки (что считается breaking change)
- [ ] Знаю процесс deprecation и миграции потребителей
- [ ] Ответил вслух на вопросы ниже

## Теория

### Storybook как платформа

Сторис (Component Story Format) — состояния компонента как код:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Select } from './Select';

const meta = { component: Select, args: { label: 'Город', options: ['Москва', 'Казань'] } } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithError: Story = { args: { error: 'Выберите город' } };

// Interaction test: та же сторис — и документация, и тест
export const KeyboardSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Город' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByRole('combobox')).toHaveTextContent('Казань');
  },
};
```

Одна сторис — это:
- **документация** (autodocs строит таблицу пропсов из TypeScript-типов);
- **interaction-тест** (play-функция, запуск в Vitest через addon-vitest);
- **a11y-проверка** (addon-a11y на axe);
- **визуальный снимок** (Chromatic или Playwright-скриншоты).

Сторис рядом с компонентом (`Select.stories.tsx`), сборка Storybook и тесты сторис в CI: если компонент изменился и сторис сломалась — PR не пройдёт. Так документация не расходится с кодом. Данные — через MSW, те же обработчики, что в тестах.

### Что должно быть в документации компонента

- Назначение: когда использовать и **когда нет** (и что вместо).
- Живые примеры типовых сценариев, копируемый код.
- Пропсы (автоматически из типов) с описаниями.
- Доступность: клавиатура, роли, что должен обеспечить потребитель (например, label).
- Do / Don't с визуальными примерами.
- Связь с Figma (ссылка на компонент, Code Connect показывает в Dev Mode код вашей библиотеки).
- Changelog и статус (beta, stable, deprecated).

### Версионирование

Semver для UI-библиотеки:
- **patch** — исправления без изменения API и заметного визуала;
- **minor** — новые компоненты, пропсы, варианты (обратно совместимо);
- **major** — удаление/переименование пропсов, изменение поведения по умолчанию, **заметное изменение визуала или размеров**, на которые потребители могли опираться в вёрстке, поднятие минимальной версии peer-зависимостей.

Инструменты: Changesets (описание изменения в PR → версия и changelog), автоматическая публикация из CI, пре-релизные каналы (`next`, `canary`) для раннего тестирования потребителями, provenance при публикации в npm.

### Deprecation и миграции

1. Новый API добавляется рядом со старым (minor).
2. Старый помечается `@deprecated` в JSDoc (IDE зачёркивает), предупреждение в dev-режиме один раз, правило линтера.
3. Codemod (jscodeshift, ast-grep) для механической миграции.
4. Измерение использования по репозиториям (react-scanner, свои скрипты по AST) — понятно, кого затронет удаление.
5. Удаление в следующем major с migration guide.

### Как библиотека попадает к потребителям

ESM-сборка с `exports`, типы, `sideEffects` (стили помечены как side effects), CSS отдельным файлом или CSS-переменные; React/Vue — в `peerDependencies`. Тестирование на основных потребителях до релиза: собрать их проекты с новой версией в CI библиотеки или через канареечный релиз.

## Вопросы с собеседований

<details><summary>Как поддерживать Storybook синхронным с реальными компонентами?</summary>

Сторис рядом с кодом, автодокументация из типов, сторис как тесты (interaction, a11y, визуальные) в CI — сломанная сторис ломает PR. Моки данных общие с тестами (MSW). Проверка, что у каждого экспортируемого компонента есть сторис.
</details>

<details><summary>Что считается breaking change в библиотеке компонентов?</summary>

Удаление и переименование экспортов и пропсов, изменение типов пропсов на несовместимые, изменение поведения по умолчанию, заметное изменение визуала или размеров, изменение DOM-структуры, на которую опираются тесты потребителей (спорно — лучше не делать её контрактом), поднятие минимальной версии peer-зависимостей или браузеров.
</details>

<details><summary>Как документировать библиотеку, чтобы документацию реально использовали?</summary>

Генерировать из кода, показывать сценарии, а не только пропсы, давать копируемые примеры и рекомендации «когда не использовать», писать о доступности, связывать с Figma, держать актуальной через тесты. Измерять: поиск по документации, вопросы в чате поддержки — частые вопросы превращать в разделы.
</details>

## Практика

1. Напишите сторис с play-функцией для своего компонента и запустите её как тест.
2. Настройте Changesets в монорепо и выпустите пре-релиз.
3. Напишите codemod, который переименовывает проп `isPrimary` в `variant="primary"`.

Тест темы: [Storybook, документация, версионирование](../quizzes/quiz.html?id=14-design-systems/04-storybook-docs-versioning).

## Источники
- [Storybook: Writing stories](https://storybook.js.org/docs/writing-stories)
- [Storybook: Interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Storybook: Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon)
- [Changesets](https://github.com/changesets/changesets)
- [Figma: Code Connect](https://www.figma.com/code-connect-docs/)
- [semver](https://semver.org/lang/ru/)
