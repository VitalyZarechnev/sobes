# Обработка ошибок и мониторинг

> ⏱ ~3 ч · 🎯 Спроектировать стратегию ошибок от API-слоя до UI, ловить всё необработанное, отправлять в мониторинг с контекстом и разбирать инциденты.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Классифицирую ошибки и знаю реакцию на каждый класс
- [ ] Использую error boundaries на уровне страниц и виджетов
- [ ] Ловлю `error` и `unhandledrejection`, понимаю «Script error.»
- [ ] Настроил Sentry: релизы, sourcemaps, контекст, фильтрация шума
- [ ] Знаю формат постмортема
- [ ] Ответил вслух на вопросы ниже

## Теория

### Классы ошибок и реакция

| Класс | Пример | Реакция |
|---|---|---|
| Сеть | офлайн, таймаут | повтор с backoff для идемпотентных запросов, офлайн-индикатор, сохранение ввода |
| 401 | истёк токен | обновить сессию, повторить запрос; не удалось — на вход с возвратом |
| 403 / 404 | нет прав / нет ресурса | понятная страница или сообщение, без повторов |
| 409 / 412 | конфликт версий | показать конфликт, предложить слить/перезаписать |
| 422 | валидация | ошибки у полей формы |
| 429 / 503 | перегрузка | повтор с учётом `Retry-After` |
| 5xx | ошибка сервера | сообщение с «Повторить», отправка в мониторинг |
| Ошибка рендера | `undefined.map` | error boundary: падает виджет, а не страница |
| Необработанная | промис без `catch` | глобальные обработчики → мониторинг |

### Единый тип ошибки в API-слое

```ts
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string, // машиночитаемый код с бэкенда: 'ORDER_LOCKED'
    message: string,
    readonly details?: Record<string, string[]>, // ошибки полей для 422
    options?: ErrorOptions,
  ) {
    super(message, options); // options.cause — исходная ошибка
    this.name = 'ApiError';
  }
  get retryable() {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }
}
```

Компоненты не разбирают сырые ответы `fetch`: API-слой превращает всё в `ApiError`, UI решает по `status`/`code`, что показать. Текст для пользователя — из словаря по `code` (и с i18n), а не из сообщения сервера.

### Error boundaries

```tsx
// React: границы на уровне маршрута и крупных виджетов
<ErrorBoundary fallback={<WidgetError onRetry={reset} />} onError={(error, info) => report(error, info)}>
  <RevenueChart />
</ErrorBoundary>
```

В React 19 `createRoot(el, { onUncaughtError, onCaughtError, onRecoverableError })` — единая точка для отправки в мониторинг. Во Vue — `onErrorCaptured` и `app.config.errorHandler`; в Nuxt — `<NuxtErrorBoundary>` и `error.vue`. Error boundary не ловит ошибки в обработчиках событий и асинхронном коде — их обрабатывают явно (или через `useActionState`/`startTransition`, ошибки которых пробрасываются в границу).

### Глобальные обработчики

```js
window.addEventListener('error', (event) => report(event.error ?? event.message));
window.addEventListener('unhandledrejection', (event) => report(event.reason));
```

🪤 **Ловушка «Script error.»:** ошибки из скриптов с другого origin приходят без деталей. Нужны `crossorigin="anonymous"` на `<script>` и заголовок `Access-Control-Allow-Origin` у CDN.

### Мониторинг (Sentry и аналоги)

- **Релиз и окружение** в каждом событии — видно, какой деплой сломал; release health (доля сессий без ошибок).
- **Sourcemaps** загружаются при деплое, в публичный бандл не попадают.
- **Контекст**: маршрут, id пользователя (не email/телефон — PII), фичефлаги, версия API; breadcrumbs (клики, навигация, запросы, консоль).
- **Шум**: фильтровать ошибки расширений браузера, ботов, `ResizeObserver loop completed…`, отменённые запросы (`AbortError`); `ignoreErrors`, `denyUrls`, `beforeSend`.
- **Sampling** событий и трейсов для контроля стоимости; ошибки — 100%, производительность — процент.
- **Session Replay** с маскированием ввода и текста — для сложных случаев.
- **Distributed tracing**: заголовок `traceparent` связывает запрос фронтенда с трейсами бэкенда.
- **Алерты**: новая ошибка в релизе, регрессия, всплеск частоты, падение crash-free sessions. Без алертов мониторинг — просто склад.

### Процесс

Еженедельный разбор топа ошибок с владельцами (по CODEOWNERS или тегам). Инциденты — постмортем без поиска виноватых: хронология, влияние (сколько пользователей, сколько времени), корневая причина (5 почему), что сработало и что нет, действия с владельцами и сроками.

## Вопросы с собеседований

<details><summary>Как вы проектируете стратегию обработки ошибок?</summary>

Классификация (сеть, авторизация, валидация, сервер, рендер, необработанные) → единый тип ошибки в API-слое → решения на уровне UI: сообщения с действием, ретраи для временных ошибок, сохранение ввода, error boundaries на уровне страниц и виджетов → глобальные обработчики → мониторинг с релизом, контекстом и алертами → регулярный разбор и постмортемы.
</details>

<details><summary>Как настроить отслеживание ошибок для продакшна?</summary>

SDK мониторинга с релизом и окружением, загрузка sourcemaps в CI без публикации, контекст без PII, breadcrumbs, фильтрация шума, sampling, связь с бэкенд-трейсами, алерты на новые и регрессировавшие ошибки, владельцы и регулярный разбор.
</details>

<details><summary>Почему в мониторинге ошибка «Script error.» без стектрейса?</summary>

Скрипт загружен с другого origin без CORS: браузер скрывает детали ошибки. Добавьте `crossorigin="anonymous"` и `Access-Control-Allow-Origin` на CDN.
</details>

<details><summary>Что не ловит error boundary в React?</summary>

Ошибки в обработчиках событий, асинхронном коде (`setTimeout`, промисы вне рендера), в самой границе и при SSR. Их нужно ловить явно или передавать в состояние, которое бросит ошибку при рендере.
</details>

## Практика

1. Реализуйте `ApiError` и обёртку над `fetch`, превращающую все ответы в него (задача в тесте темы).
2. Подключите Sentry к пет-проекту с релизами и hidden sourcemaps, проверьте читаемый стектрейс.
3. Напишите шаблон постмортема для своей команды.

Тест темы: [Ошибки и мониторинг](../quizzes/quiz.html?id=15-production/01-errors-and-monitoring).

## Источники
- [Sentry: JavaScript](https://docs.sentry.io/platforms/javascript/)
- [Sentry: Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [React: Catching rendering errors with an Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React: createRoot options](https://react.dev/reference/react-dom/client/createRoot)
- [MDN: unhandledrejection](https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event)
- [Google SRE: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
