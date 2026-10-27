# Playwright: e2e-тесты на практике

> ⏱ ~4 ч · 🎯 Писать стабильные e2e-тесты: локаторы и автоожидание, фикстуры, авторизация, подмена сети, отладка через trace, параллельность и шардинг в CI, скриншотные тесты и борьба с нестабильными тестами.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Выбираю локаторы по роли и тексту, понимаю strict mode
- [ ] Понимаю автоожидание действий и «веб-первые» проверки `expect(locator)`
- [ ] Пишу фикстуры через `test.extend` и знаю встроенные (`page`, `context`, `request`)
- [ ] Логинюсь один раз через setup-проект и `storageState`
- [ ] Подменяю ответы API через `page.route`
- [ ] Отлаживаю упавший в CI тест по trace
- [ ] Настраиваю ретраи, параллельность и шардинг; понимаю статус `flaky`
- [ ] Знаю причины нестабильных тестов и как их устранять
- [ ] Ответил вслух на вопросы ниже

## Теория

### Модель: браузер → контекст → страница

- **Browser** — запущенный Chromium, Firefox или WebKit.
- **BrowserContext** — изолированный профиль: свои cookies, localStorage, кэш. Каждый тест по умолчанию получает **новый контекст** — тесты не делят состояние и могут идти параллельно.
- **Page** — вкладка внутри контекста.

Playwright управляет браузером по протоколу отладки и ждёт событий браузера, поэтому ему не нужны «sleep» между шагами — в отличие от старых решений на WebDriver.

### Конфигурация

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,          // забытый test.only валит CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? [['blob'], ['github']] : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',             // trace пишется при повторном запуске упавшего теста
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' }, dependencies: ['setup'] },
    { name: 'mobile', use: { ...devices['iPhone 15'], storageState: 'playwright/.auth/user.json' }, dependencies: ['setup'] },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Локаторы

Приоритет — как в Testing Library: так, как пользователь (и скринридер) видит страницу.

```ts
page.getByRole('button', { name: 'Оформить заказ' });
page.getByLabel('Email');
page.getByPlaceholder('Поиск');
page.getByText('Корзина пуста');
page.getByTestId('cart-total');            // когда семантики нет
page.getByRole('listitem').filter({ hasText: 'Молоко' }).getByRole('button', { name: 'Удалить' });
```

- Локатор — это **описание**, а не найденный элемент. Он ищется заново при каждом действии, поэтому не «протухает» после перерисовки.
- **Strict mode:** если локатор нашёл несколько элементов, действие (`click`, `fill`) падает. Это защищает от клика «не туда». Уточняйте локатор (`filter`, вложенность), а не берите `.first()` по привычке.
- CSS и XPath — последний вариант: они завязаны на вёрстку и ломаются при рефакторинге.

### Автоожидание и веб-первые проверки

Перед действием Playwright сам ждёт, что элемент **видим, стабилен (не анимируется), принимает события, включён** (а для `fill` — редактируем).

```ts
await page.getByRole('button', { name: 'Сохранить' }).click();
await expect(page.getByText('Сохранено')).toBeVisible();     // повторяет проверку до таймаута
await expect(page.getByRole('listitem')).toHaveCount(3);
await expect(page).toHaveURL(/\/orders\/\d+/);
```

🪤 **Ловушка:** `expect(await locator.isVisible()).toBe(true)` проверяет **один раз**, без ожидания. Нужна веб-первая форма `await expect(locator).toBeVisible()` — она перепроверяет, пока условие не выполнится или не истечёт таймаут.

Для того, что не является локатором:
```ts
await expect.poll(() => api.getOrderStatus(id)).toBe('paid');
await expect(async () => {
  const res = await page.request.get('/api/health');
  expect(res.status()).toBe(200);
}).toPass({ timeout: 10_000 });
```

🪤 **Ловушка:** `page.waitForTimeout(2000)` — главный источник медленных и нестабильных тестов. Ждите **событие или состояние**: элемент, ответ сети (`page.waitForResponse`), URL.

### Фикстуры

```ts
// e2e/fixtures.ts
import { test as base } from '@playwright/test';
import { CartPage } from './pages/cart-page';

export const test = base.extend<{ cartPage: CartPage; seededUser: { email: string } }>({
  seededUser: async ({ request }, use) => {
    const res = await request.post('/api/test/users');   // подготовка через API — быстро
    const user = await res.json();
    await use(user);                                      // здесь выполняется тест
    await request.delete(`/api/test/users/${user.id}`);   // очистка после теста
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});
```

Фикстура создаётся, только если тест её запросил, и сама убирает за собой. Это лучше, чем `beforeEach` с общими переменными. Page Object (`CartPage`) прячет локаторы и шаги, но проверки лучше оставлять в тесте — так видно, что именно проверяется.

### Авторизация один раз

```ts
// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_USER!);
  await page.getByLabel('Пароль').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByRole('button', { name: 'Профиль' })).toBeVisible();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

Остальные проекты зависят от `setup` и стартуют уже с cookies и localStorage. Файл состояния — в `.gitignore`. Для разных ролей — несколько файлов состояния.

### Сеть: подмена и ожидание

```ts
await page.route('**/api/products*', (route) =>
  route.fulfill({ json: [{ id: 1, title: 'Тестовый товар', price: 100 }] }),
);
await page.route('**/analytics/**', (route) => route.abort());      // не слать аналитику из тестов
await page.route('**/api/cart', async (route) => {
  const response = await route.fetch();                              // настоящий ответ…
  const json = await response.json();
  await route.fulfill({ response, json: { ...json, discount: 50 } }); // …с подменой поля
});

const [response] = await Promise.all([
  page.waitForResponse((r) => r.url().includes('/api/orders') && r.request().method() === 'POST'),
  page.getByRole('button', { name: 'Оформить' }).click(),
]);
expect(response.status()).toBe(201);
```

Когда мокать, а когда нет: e2e ценен тем, что проверяет систему целиком, поэтому критичные сценарии (вход, оплата) лучше гонять против настоящего бэкенда на тестовом стенде. Моки — для редких состояний (ошибка 500, пустой список, медленный ответ) и внешних сервисов. Фикстура `request` позволяет тестировать API напрямую и готовить данные без интерфейса.

### Время

```ts
await page.clock.install({ time: new Date('2026-01-31T23:59:50') });
await page.goto('/promo');
await page.clock.fastForward('00:15');   // таймер акции истёк без реального ожидания
```

### Отладка

- `npx playwright test --ui` — UI-режим: шаги, DOM на каждом шаге, повторный запуск, режим наблюдения.
- `npx playwright test --debug` — пошаговое выполнение с инспектором.
- `npx playwright codegen URL` — записать действия и получить черновик теста с локаторами.
- **Trace viewer**: `npx playwright show-trace trace.zip` или trace.playwright.dev. В trace есть таймлайн действий, DOM-снимки до и после каждого шага, сеть, консоль, исходник теста. Это главный инструмент для теста, упавшего **только в CI**: скачиваете артефакт и видите, что было на экране.

### Параллельность, шардинг, ретраи

- Воркеры — отдельные процессы. С `fullyParallel: true` параллельно идут и тесты внутри одного файла.
- Тесты не должны зависеть друг от друга и от порядка. Если сценарий по сути один (шаги одной покупки) — `test.describe.configure({ mode: 'serial' })` или один тест с `test.step`.
- **Шардинг**: `npx playwright test --shard=1/4` на 4 машинах CI, затем `npx playwright merge-reports` объединяет blob-отчёты в один HTML-отчёт.
- **Ретраи**: тест, упавший и прошедший при повторе, получает статус **flaky**. По умолчанию это не валит прогон, но такие тесты нужно собирать и чинить. Опция `failOnFlakyTests` делает их фатальными.

### Скриншотные тесты

```ts
await expect(page).toHaveScreenshot('checkout.png', { mask: [page.getByTestId('timestamp')] });
await expect(page.getByRole('dialog')).toHaveScreenshot();
```

- Эталоны зависят от ОС, шрифтов и рендеринга. Генерируйте и проверяйте их в одном окружении — обычно в официальном Docker-образе Playwright. Обновление: `--update-snapshots`.
- Маскируйте динамику (даты, аватары, рекламу), отключайте анимации, фиксируйте время через `page.clock`.
- Для структуры без пикселей — `toMatchAriaSnapshot()`: сравнивает дерево доступности. Устойчиво к смене стилей.

### Почему тесты нестабильны и что с этим делать

| Причина | Лечение |
|---|---|
| Фиксированные паузы `waitForTimeout` | ждать состояние: веб-первые проверки, `waitForResponse` |
| Проверка без ожидания (`isVisible()` в `expect`) | `await expect(locator).toBeVisible()` |
| Общие данные между тестами (один пользователь, одна корзина) | свои данные на тест через фикстуры и API |
| Зависимость от порядка тестов | независимые тесты, подготовка в фикстуре |
| Анимации, переходы | `reducedMotion: 'reduce'`, автоожидание стабильности |
| Время и случайность | `page.clock`, фиксированный seed |
| Медленный или нестабильный тестовый стенд | моки внешних сервисов, health-check перед прогоном |
| Неоднозначный локатор | роли и доступные имена, strict mode |

Процесс: нестабильный тест — это баг. Его помечают (`test.fixme` с задачей) или чинят сразу, а не увеличивают число ретраев. Метрику «доля flaky» стоит видеть в отчёте CI.

### Где e2e в стратегии

E2E дорогие и медленные — ими покрывают **критичные пользовательские пути**: вход, покупку, ключевую форму. Логику и граничные случаи — unit- и интеграционными тестами. Подробно — в [стратегии тестирования](04-testing-strategy.md); пайплайн и шардинг в CI — в [CI/CD](05-ci-cd-devops.md).

## Вопросы с собеседований

<details><summary>Чем Playwright отличается от Selenium и Cypress?</summary>

От Selenium (WebDriver) — встроенным автоожиданием, изоляцией через browser context, trace viewer, параллельностью из коробки и одним API для Chromium, Firefox и WebKit. От Cypress — тесты выполняются вне браузера (Node), поэтому нет ограничений на несколько вкладок и доменов, есть нативная параллельность без платного сервиса, полноценный async/await вместо цепочек команд.
</details>

<details><summary>Почему `expect(await locator.isVisible()).toBe(true)` делает тест нестабильным?</summary>

`isVisible()` проверяет состояние один раз, в момент вызова. Если элемент появится через 100 мс, проверка уже провалилась. Веб-первая проверка `await expect(locator).toBeVisible()` повторяет проверку до таймаута.
</details>

<details><summary>Как не логиниться в каждом тесте?</summary>

Setup-проект логинится один раз и сохраняет `storageState` (cookies и localStorage) в файл. Остальные проекты зависят от setup и стартуют с этим состоянием. Для разных ролей — разные файлы. Для API-логина можно не открывать браузер, а получить токен через `request`.
</details>

<details><summary>Тест падает только в CI. Как будете разбираться?</summary>

Включён `trace: 'on-first-retry'` — скачиваю trace из артефактов и смотрю DOM-снимки, сеть и консоль в момент падения. Проверяю различия окружения: размер окна, скорость машины (тайминги), данные тестового стенда, шрифты для скриншотов, параллельные тесты с общими данными. Воспроизвожу локально с `--repeat-each=20` и `--workers` как в CI.
</details>

<details><summary>Что такое flaky-тест в терминах Playwright и что с ним делать?</summary>

Тест, который упал, а при ретрае прошёл. По умолчанию прогон остаётся зелёным, но в отчёте тест отмечен как flaky. Нельзя лечить это увеличением ретраев: нужно найти причину (ожидания, общие данные, порядок, время) или временно пометить `test.fixme` с задачей. Долю flaky полезно отслеживать как метрику.
</details>

<details><summary>Как ускорить e2e-прогон в CI?</summary>

Параллельность (`fullyParallel`, воркеры), шардинг по машинам с `merge-reports`, подготовка данных через API вместо UI, логин один раз через `storageState`, запуск против собранного приложения, кэш браузеров Playwright, запуск только нужных проектов (браузеров) на PR, а полный набор — ночью.
</details>

<details><summary>Когда в e2e мокать сеть, а когда нет?</summary>

Критичные сценарии — против настоящего бэкенда на тестовом стенде: в этом смысл e2e. Мокать — внешние сервисы (платёжки, аналитику), редкие и трудновоспроизводимые состояния (500, таймаут, пустые данные). Если моков становится большинство, это скорее интеграционные тесты в браузере.
</details>

<details><summary>Почему скриншотные тесты расходятся между машинами и как это исправить?</summary>

Разные ОС, шрифты, сглаживание, GPU и DPR дают разные пиксели. Эталоны генерируют и проверяют в одном окружении (Docker-образ Playwright), маскируют динамические области, отключают анимации, фиксируют время и данные, задают допустимое отклонение (`maxDiffPixelRatio`).
</details>

## Практика

1. Напишите e2e для входа и одного ключевого сценария своего проекта: setup-проект с `storageState`, локаторы только по ролям и подписям.
2. Подмените API так, чтобы проверить состояние ошибки и пустого списка.
3. Сломайте тест паузой `waitForTimeout(100)` и прогоните с `--repeat-each=30 --workers=4`. Затем почините веб-первой проверкой.
4. Настройте шардинг на 3 джобы в GitHub Actions с объединением отчётов и выгрузкой trace как артефакта.

Тест темы: [Playwright](../quizzes/quiz.html?id=10-tooling-testing/07-playwright).

## Источники
- [Playwright: Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright: Locators](https://playwright.dev/docs/locators)
- [Playwright: Auto-waiting](https://playwright.dev/docs/actionability)
- [Playwright: Authentication](https://playwright.dev/docs/auth)
- [Playwright: Mock APIs](https://playwright.dev/docs/mock)
- [Playwright: Trace viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright: Sharding](https://playwright.dev/docs/test-sharding)
- [Playwright: Visual comparisons](https://playwright.dev/docs/test-snapshots)
