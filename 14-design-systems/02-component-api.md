# API компонентов

> ⏱ ~3 ч · 🎯 Проектировать API компонентов дизайн-системы, которые переживают изменения требований: композиция вместо флагов, controlled/uncontrolled, проброс атрибутов и ref, headless-логика.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Знаю признаки плохого API: булевы флаги, «универсальный» компонент, утечки реализации
- [ ] Использую compound components и слоты
- [ ] Поддерживаю controlled и uncontrolled режимы
- [ ] Пробрасываю нативные атрибуты и `ref`, понимаю `asChild`/polymorphic `as`
- [ ] Разделяю headless-логику и стили
- [ ] Ответил вслух на вопросы ниже

## Теория

### Анти-паттерн: компонент-«комбайн»

```tsx
// Через год: 25 пропсов, половина взаимоисключающие
<Card
  title="Заказ"
  subtitle="№ 123"
  showAvatar
  avatarUrl="..."
  isCompact
  hasFooter
  footerButtonText="Открыть"
  onFooterButtonClick={open}
  isHighlighted
/>
```

Каждый новый вариант → новый флаг → комбинаторный взрыв состояний, которые никто не тестировал.

### Композиция

```tsx
<Card tone="highlight">
  <Card.Header>
    <Avatar src={user.avatar} />
    <Card.Title>Заказ</Card.Title>
    <Card.Subtitle>№ 123</Card.Subtitle>
  </Card.Header>
  <Card.Body>…</Card.Body>
  <Card.Footer>
    <Button onClick={open}>Открыть</Button>
  </Card.Footer>
</Card>
```

- **Compound components** — набор связанных компонентов с общим неявным состоянием через контекст (`Tabs` + `Tabs.List` + `Tabs.Trigger` + `Tabs.Panel`, `Select` + `Select.Option`).
- **Слоты** — именованные места для контента: `children`/render props в React, `<slot name="footer">` во Vue и Web Components.
- **Варианты** — union-типы вместо булевых флагов: `variant: 'primary' | 'secondary' | 'ghost'`, `size: 'sm' | 'md' | 'lg'`. Невозможные комбинации не выражаются типами.

### Controlled и uncontrolled

```tsx
interface DisclosureProps {
  open?: boolean; // controlled
  defaultOpen?: boolean; // uncontrolled начальное значение
  onOpenChange?: (open: boolean) => void;
}

function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const setValue = (next: T) => {
    if (!isControlled) setInner(next);
    onChange?.(next);
  };
  return [current, setValue] as const;
}
```

Соглашение `value`/`defaultValue`/`onValueChange` как у нативных элементов: компонент работает «из коробки» и позволяет полностью управлять состоянием снаружи (синхронизация с URL, формой, стором). Во Vue — `defineModel` (`v-model`).

### Проброс атрибутов и ref

```tsx
type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };

// React 19: ref — обычный проп, forwardRef не нужен
function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={cx('btn', `btn--${variant}`, className)} {...rest} />;
}
```

Пользователь библиотеки должен иметь возможность передать `aria-*`, `data-*`, обработчики, `ref` (фокус, позиционирование поповеров, измерения).

### Полиморфизм: `as` и `asChild`

- `as` — `<Button as="a" href="/x">`: компонент рендерит другой тег. Сложно типизировать, смешиваются пропсы.
- `asChild` (Radix) / `render` (Base UI, Ariakit) — компонент передаёт свои пропсы и поведение единственному ребёнку: `<Button asChild><Link to="/x">Открыть</Link></Button>`. Хорошо работает с роутерами и сторонними компонентами.

### Headless + стили

Поведение (клавиатура, фокус, ARIA, состояния) — в headless-слое (хуки/примитивы: React Aria, Radix, Ark UI/Zag, Headless UI, Reka UI для Vue). Стили — отдельно (токены, CSS). Так можно сменить визуальный язык без переписывания логики и не переизобретать доступность. Shadcn/ui — популярный подход «копируйте компоненты к себе» поверх Radix + Tailwind: полная кастомизация, но обновления — вручную.

### Эволюция API

- Добавлять — можно (новый необязательный проп, новый вариант).
- Менять поведение или удалять — только через deprecation-период и мажорную версию.
- Пропсы называть по назначению, а не по реализации (`tone="danger"`, а не `red`).
- Не протекать реализацией: не принимать `styles` для внутренних элементов без нужды, не раскрывать внутреннюю структуру DOM как контракт.

## Вопросы с собеседований

<details><summary>Как спроектировать API компонента, чтобы он не оброс флагами?</summary>

Начать с реальных сценариев, использовать композицию (compound components, слоты/children), варианты как union, разделить логику и отображение, дать controlled/uncontrolled режимы и проброс атрибутов. Новый сценарий — сначала попробовать собрать из существующих частей, а не добавлять флаг.
</details>

<details><summary>Что такое compound components и как они делят состояние?</summary>

Набор компонентов, используемых вместе (`Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`), с общим состоянием через контекст родителя. Пользователь управляет структурой и порядком, а состояние и доступность компонент обеспечивает сам.
</details>

<details><summary>Чем `asChild` лучше пропа `as`?</summary>

`as` меняет тег, но смешивает пропсы и плохо типизируется с произвольными компонентами. `asChild` сливает пропсы, обработчики и `ref` с переданным ребёнком — можно использовать `Link` роутера или любой компонент, сохраняя его типы.
</details>

<details><summary>Зачем поддерживать и controlled, и uncontrolled режимы?</summary>

Uncontrolled — простое использование без лишнего кода. Controlled — когда состояние нужно синхронизировать с внешним миром (URL, форма, аналитика, другие компоненты). Нужно избегать переключения между режимами во время жизни компонента (React предупреждает).
</details>

## Практика

1. Перепишите `Card` с 10 булевыми пропсами в compound-компонент.
2. Реализуйте `useControllableState` и `Disclosure` с обоими режимами, покройте тестами.
3. Сделайте `Button` с `asChild`, который работает с `<a>` и `Link` роутера.

Тест темы: [API компонентов](../quizzes/quiz.html?id=14-design-systems/02-component-api).

## Источники
- [Radix: Composition (asChild)](https://www.radix-ui.com/primitives/docs/guides/composition)
- [React Aria: Hooks](https://react-spectrum.adobe.com/react-aria/hooks.html)
- [Kent C. Dodds: Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [React: Sharing state between components](https://react.dev/learn/sharing-state-between-components)
- [Vue: Slots](https://vuejs.org/guide/components/slots.html)
