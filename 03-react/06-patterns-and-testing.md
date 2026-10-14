# Паттерны и тестирование

> ⏱ ~3 ч · 🎯 Проектировать API переиспользуемых компонентов (compound, headless, controlled/uncontrolled), знать эволюцию паттернов (HOC → render props → хуки), корректно обрабатывать ошибки и порталы, выстроить стратегию тестирования React-приложения.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Могу написать compound component на контексте и объяснить плюсы
- [ ] Реализую компонент, поддерживающий controlled и uncontrolled режимы
- [ ] Знаю, что Error Boundary ловит и что нет
- [ ] Понимаю всплытие событий через портал
- [ ] Могу описать пирамиду/трофей тестирования и инструменты: RTL, Vitest, MSW, Playwright

## Теория

### Эволюция переиспользования логики

| Паттерн | Суть | Проблемы |
|---|---|---|
| Mixins (классы, давно) | смешивание методов | конфликты имён, неявные зависимости |
| HOC | `withX(Component)` возвращает обёртку | wrapper hell, коллизии пропсов, сложная типизация, ref не проходит |
| Render props | компонент вызывает `children(state)` | вложенность «callback hell» в JSX |
| Хуки | `useX()` | правила хуков; основной способ сегодня |

HOC и render props не умерли: HOC полезны для кросс-срезовых обёрток на уровне модулей (`withErrorBoundary`, `observer` в MobX, аналитика), render props — когда ребёнок решает, **что рендерить** с данными родителя (виртуализированные списки, `<Field render>`).

```tsx
// HOC
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const user = useUser();
    if (!user) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
}

// Render props
<Virtualized items={rows} rowHeight={32}>
  {(row, style) => <div style={style}>{row.name}</div>}
</Virtualized>
```

### Compound components

Набор компонентов, которые работают вместе и делят неявное состояние через контекст. API декларативный и гибкий в разметке.

```tsx
type TabsCtx = { active: string; setActive: (id: string) => void; baseId: string };
const TabsContext = createContext<TabsCtx | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>');
  return ctx;
}

function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  const baseId = useId();
  const value = useMemo(() => ({ active, setActive, baseId }), [active, baseId]);
  return <TabsContext value={value}>{children}</TabsContext>;
}

function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  const { active, setActive, baseId } = useTabs();
  const selected = active === value;
  return (
    <button role="tab" id={`${baseId}-tab-${value}`} aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`} tabIndex={selected ? 0 : -1}
      onClick={() => setActive(value)}>{children}</button>
  );
}

function Panel({ value, children }: { value: string; children: React.ReactNode }) {
  const { active, baseId } = useTabs();
  if (active !== value) return null;
  return <div role="tabpanel" id={`${baseId}-panel-${value}`} aria-labelledby={`${baseId}-tab-${value}`}>{children}</div>;
}

Tabs.List = ({ children }: { children: React.ReactNode }) => <div role="tablist">{children}</div>;
Tabs.Tab = Tab;
Tabs.Panel = Panel;

// <Tabs defaultValue="a"><Tabs.List><Tabs.Tab value="a">A</Tabs.Tab></Tabs.List><Tabs.Panel value="a">…</Tabs.Panel></Tabs>
```

Плюсы: нет prop drilling конфигурации, потребитель контролирует разметку и порядок. Минусы: неявная связь, нужна проверка провайдера; клавиатурная навигация (стрелки) требует регистрации элементов.

Альтернатива — **slot-пропсы** (`<Card header={...} footer={...} />`) — проще, но менее гибко.

### Headless-компоненты

Логика и доступность без стилей: хук или набор unstyled-компонентов. Примеры: Radix UI, React Aria, Headless UI, Ariakit, TanStack Table, Downshift. Основа современных дизайн-систем (shadcn/ui — копируемые компоненты поверх Radix + Tailwind).

```tsx
function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const id = useId();
  return {
    open,
    toggle: () => setOpen(o => !o),
    close: () => setOpen(false),
    buttonProps: { 'aria-expanded': open, 'aria-controls': id, onClick: () => setOpen(o => !o) },
    panelProps: { id, hidden: !open },
  };
}
```

💡 На собеседовании (lead): «Для дизайн-системы я бы не писал доступность с нуля: брал бы headless-основу (React Aria / Radix), а наш слой — токены, стили и композиция. Это экономит месяцы и даёт корректные ARIA-паттерны, фокус-менеджмент и поддержку клавиатуры».

Также: **prop getters** (`getToggleProps()`) и **state reducer** (позволить потребителю переопределять переходы, как в Downshift) — паттерны инверсии контроля.

### Controlled vs uncontrolled

- **Controlled**: значение в пропсе (`value` + `onChange`), источник истины — родитель.
- **Uncontrolled**: значение внутри (DOM или state компонента), родитель задаёт `defaultValue` и читает через ref/FormData.

Хороший библиотечный компонент поддерживает оба режима:

```tsx
function useControllableState<T>({ value, defaultValue, onChange }: {
  value?: T; defaultValue: T; onChange?: (v: T) => void;
}) {
  const [inner, setInner] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;
  const setValue = useCallback((next: T) => {
    if (!isControlled) setInner(next);
    onChange?.(next);
  }, [isControlled, onChange]);
  return [current, setValue] as const;
}

function Toggle(props: { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (v: boolean) => void }) {
  const [checked, setChecked] = useControllableState({
    value: props.checked, defaultValue: props.defaultChecked ?? false, onChange: props.onCheckedChange,
  });
  return <button role="switch" aria-checked={checked} onClick={() => setChecked(!checked)} />;
}
```

🪤 Ловушка: переключение между режимами (`value` то `undefined`, то строка) — React предупреждает «changing an uncontrolled input to be controlled». Используйте `value ?? ''`.

С React 19 и `<form action>` неконтролируемые формы стали снова популярны: меньше ререндеров, данные берутся из `FormData`.

### Error Boundaries

Классовый компонент с `static getDerivedStateFromError` (рендер fallback) и/или `componentDidCatch` (логирование). Функционального аналога нет — используют `react-error-boundary`.

```tsx
class ErrorBoundary extends React.Component<
  { fallback: (error: Error, reset: () => void) => React.ReactNode; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, info.componentStack);       // Sentry и т.п.
  }
  reset = () => this.setState({ error: null });
  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.reset) : this.props.children;
  }
}
```

Ловит: ошибки во время рендера, в методах жизненного цикла, в конструкторах детей, отклонённые промисы из `use()`, ошибки в Actions (`<form action>`, `startTransition(async)`) — React 19 пробрасывает их в ближайшую границу.

Не ловит: обработчики событий (используйте try/catch), асинхронный код вне React (`setTimeout`, `fetch().then` в эффекте — нужно передать ошибку в state), ошибки в самой границе, SSR.

Где ставить: на уровне маршрута, вокруг независимых виджетов (падение графика не должно ронять страницу), вокруг lazy-чанков. Сброс — `resetKeys` при смене маршрута/параметров. React 19: `createRoot(el, { onCaughtError, onUncaughtError, onRecoverableError })` для централизованного логирования.

### Порталы

`createPortal(children, domNode)` рендерит детей в другой DOM-узел (обычно `document.body`) — для модалок, тултипов, тостов, чтобы обойти `overflow: hidden` и stacking context.

Ключевой нюанс: портал остаётся **в React-дереве** на прежнем месте:
- контекст доступен как обычно;
- **события всплывают по React-дереву**, а не по DOM: клик внутри модалки-портала вызовет `onClick` у React-родителя, хотя в DOM модалка вне его.

```tsx
function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>{children}</div>
    </div>,
    document.body,
  );
}
```

Современная альтернатива для модалок — нативный `<dialog>` с `showModal()` (top layer, inert-фон, Esc из коробки) и Popover API для поповеров.

### Тестирование: стратегия

**Testing Trophy** (Kent C. Dodds): статический анализ (TS, ESLint) → немного unit → **основная масса интеграционных** → немного e2e. Принцип RTL: «Чем больше тесты похожи на то, как используется ПО, тем больше уверенности они дают» — тестируем поведение, а не реализацию.

| Уровень | Инструмент | Что проверяет |
|---|---|---|
| Статика | TypeScript, ESLint (`react-hooks`, `jsx-a11y`) | типы, правила хуков, a11y |
| Unit | Vitest | чистые функции, редьюсеры, хуки (`renderHook`) |
| Интеграционные (компонентные) | Vitest + RTL + MSW (jsdom/happy-dom) или Vitest Browser Mode | компонент/страница с реальными детьми и замоканной сетью |
| E2E | Playwright | критичные пользовательские сценарии в реальном браузере |
| Визуальные | Storybook + Chromatic / Playwright screenshots | регрессии вёрстки |

### React Testing Library + Vitest

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('LoginForm', () => {
  it('отправляет данные и показывает ошибку сервера', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Неверный пароль'));
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.c');
    await user.type(screen.getByLabelText(/пароль/i), 'secret');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный пароль');
  });
});
```

Правила:
- Запросы по приоритету: `getByRole` (с `name`) → `getByLabelText` → `getByText` → `getByTestId` в крайнем случае. Тест по ролям заодно проверяет доступность.
- `getBy` — должен быть, `queryBy` — проверка отсутствия, `findBy` — асинхронное появление.
- `userEvent` вместо `fireEvent` — эмулирует полную последовательность событий (focus, keydown, input…).
- Не тестировать state, вызовы хуков, имена классов. Не мокать дочерние компоненты без нужды.
- `act()` в большинстве случаев оборачивают за вас RTL; предупреждение «not wrapped in act» обычно значит, что тест не дождался асинхронного обновления (`findBy`, `waitFor`).
- Хуки: `renderHook(() => useCounter(), { wrapper })`.

### MSW — мок сети

Mock Service Worker перехватывает запросы на уровне сети (Service Worker в браузере, интерсептор в Node) — компоненты используют реальный `fetch`/клиент. Одни и те же хэндлеры для тестов, Storybook и локальной разработки.

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  http.get('/api/users/:id', ({ params }) => HttpResponse.json({ id: params.id, name: 'Ann' })),
];
export const server = setupServer(...handlers);

// vitest.setup.ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// в тесте — переопределить на ошибку
server.use(http.get('/api/users/:id', () => new HttpResponse(null, { status: 500 })));
```

Для TanStack Query в тестах — новый `QueryClient` на тест с `retry: false`.

### Playwright

E2E в Chromium/Firefox/WebKit, авто-ожидания, локаторы по ролям, трассировка, параллелизм, моки сети (`page.route`), визуальные снапшоты, компонентное тестирование.

```ts
import { test, expect } from '@playwright/test';

test('пользователь оформляет заказ', async ({ page }) => {
  await page.goto('/catalog');
  await page.getByRole('button', { name: 'В корзину' }).first().click();
  await page.getByRole('link', { name: /корзина/i }).click();
  await expect(page.getByRole('heading', { name: 'Корзина' })).toBeVisible();
  await page.getByRole('button', { name: 'Оформить' }).click();
  await expect(page).toHaveURL(/\/checkout\/success/);
});
```

Анти-флаки: не использовать `waitForTimeout`, полагаться на web-first assertions (`expect(locator).toBeVisible()`), изолировать данные (сид на тест), `storageState` для логина один раз.

## Вопросы с собеседований

<details><summary>HOC vs render props vs хуки — когда что?</summary>

Хуки — дефолт для переиспользования логики. Render props — когда потребитель решает, что рендерить с данными (виртуализация, формы). HOC — обёртки на уровне модуля/кросс-срезовые (ошибки, аналитика, MobX observer), но с риском коллизий пропсов и сложной типизацией.
</details>

<details><summary>Что такое compound components и как их реализовать?</summary>

Набор связанных компонентов с общим неявным состоянием через Context (`<Select>`, `<Select.Option>`). Родитель держит state и отдаёт его через провайдер, дети читают с проверкой наличия провайдера. Даёт гибкость разметки. Для a11y и клавиатурной навигации нужен механизм регистрации элементов (descendants).
</details>

<details><summary>Как сделать компонент, работающий и в controlled, и в uncontrolled режиме?</summary>

Принять `value`/`defaultValue`/`onChange`; если `value !== undefined` — контролируемый, иначе внутренний state. Вызывать `onChange` в обоих режимах. Предупреждать о смене режима в процессе жизни.
</details>

<details><summary>Что не ловит Error Boundary?</summary>

Ошибки в обработчиках событий, асинхронном коде вне рендера (таймеры, промисы в эффектах без проброса в state), SSR, в самой границе. Для них — try/catch, `window.onerror`/`unhandledrejection` и проброс в state, чтобы вызвать ошибку при рендере.
</details>

<details><summary>Как всплывают события из портала?</summary>

По React-дереву, а не по DOM. Родитель портала получает синтетические события детей портала. Это бывает неожиданно: клик в модалке вызывает `onClick` строки таблицы, из которой модалка открыта. Решение — `stopPropagation` или вынос модалки.
</details>

<details><summary>Почему RTL рекомендует getByRole?</summary>

Он ищет элементы так, как их видят вспомогательные технологии и пользователи, — тест проверяет и функциональность, и доступность, устойчив к рефакторингу разметки и классов.
</details>

<details><summary>Зачем MSW, если можно замокать fetch через vi.fn?</summary>

MSW мокает на уровне сети: код компонента и клиента (axios, Query, fetch) работает как в проде, тест не завязан на реализацию HTTP-слоя. Хэндлеры переиспользуются в Storybook и dev. Меньше хрупкости при смене клиента.
</details>

<details><summary>Как бы вы выстроили стратегию тестирования фронтенда для команды?</summary>

TS strict + ESLint в CI; unit для доменной логики и утилит; интеграционные на уровне фич/страниц с RTL + MSW как основная масса; несколько Playwright-сценариев на критичные пути (логин, оплата) на стейдже; визуальная регрессия для дизайн-системы. Метрики — не только покрытие, но и время прогона и доля флаки. Тесты — часть Definition of Done.
</details>

<details><summary>jsdom или Vitest Browser Mode?</summary>

jsdom быстрый, но эмулирует DOM неполно (нет layout, IntersectionObserver, реальных стилей). Browser Mode (через Playwright-провайдер) запускает тесты в настоящем браузере — точнее, но медленнее. Для компонентов, зависящих от layout/фокуса/CSS, — браузерный режим.
</details>

<details><summary>Как тестировать кастомный хук?</summary>

Через `renderHook` с нужным `wrapper` (провайдеры), действия в `act`, проверка `result.current`. Если хук сильно связан с UI — тестировать через компонент, использующий его. Чистую логику выносить в функции и тестировать отдельно.
</details>

## Практика

**1. Реализуй** compound-компонент `Accordion` с поддержкой режимов single/multiple и controlled `value`.

<details><summary>Решение (скелет)</summary>

```tsx
type Ctx = { isOpen: (id: string) => boolean; toggle: (id: string) => void };
const AccordionCtx = createContext<Ctx | null>(null);

function Accordion({ multiple = false, value, defaultValue = [], onValueChange, children }: {
  multiple?: boolean; value?: string[]; defaultValue?: string[];
  onValueChange?: (v: string[]) => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const ctx = useMemo<Ctx>(() => ({
    isOpen: id => open.includes(id),
    toggle: id => setOpen(open.includes(id) ? open.filter(x => x !== id) : multiple ? [...open, id] : [id]),
  }), [open, multiple, setOpen]);
  return <AccordionCtx value={ctx}>{children}</AccordionCtx>;
}
```

`Accordion.Item` даёт id через контекст элемента, `Trigger` — кнопка с `aria-expanded`, `Content` — `hidden={!isOpen}`.
</details>

**2. Напиши тест** для компонента, загружающего список пользователей: проверь лоадер, данные и ошибку.

<details><summary>Решение</summary>

```tsx
it('показывает пользователей', async () => {
  render(<Users />, { wrapper: QueryWrapper });
  expect(screen.getByRole('status')).toHaveTextContent(/загрузка/i);
  expect(await screen.findByRole('listitem', { name: /ann/i })).toBeInTheDocument();
});

it('показывает ошибку', async () => {
  server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 })));
  render(<Users />, { wrapper: QueryWrapper });
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
```
</details>

**3. Почему тест флаки?** `await user.click(btn); expect(screen.getByText('Сохранено')).toBeInTheDocument();` иногда падает.

<details><summary>Решение</summary>

Текст появляется после асинхронной операции. `getBy` проверяет синхронно. Нужен `await screen.findByText('Сохранено')`.
</details>

## Источники
- https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- https://react.dev/reference/react-dom/createPortal
- https://react.dev/learn/sharing-state-between-components
- https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
- https://testing-library.com/docs/react-testing-library/intro/
- https://testing-library.com/docs/queries/about/#priority
- https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- https://vitest.dev/guide/
- https://mswjs.io/docs/
- https://playwright.dev/docs/intro
- https://www.radix-ui.com/primitives
- https://react-spectrum.adobe.com/react-aria/
- https://github.com/bvaughn/react-error-boundary
