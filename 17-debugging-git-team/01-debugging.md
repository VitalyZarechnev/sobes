# Отладка: DevTools и методика поиска багов

> ⏱ ~3 ч · 🎯 Находить причину бага системно, а не перебором: воспроизведение, сужение области, проверка гипотез, и владеть DevTools шире, чем `console.log`.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Использую условные breakpoints, logpoints, breakpoints на DOM и XHR
- [ ] Умею пользоваться Network (throttling, блокировка запросов, overrides)
- [ ] Записываю и читаю профиль Performance
- [ ] Нахожу утечку памяти через heap snapshots
- [ ] Отлаживаю мобильные браузеры и продакшен со sourcemaps
- [ ] Ответил вслух на вопросы ниже

## Теория

### Методика

1. **Воспроизвести.** Шаги, окружение (браузер, устройство, локаль, часовой пояс, роль пользователя, данные), частота. Минимальный пример. Не воспроизводится — собрать данные: Sentry с breadcrumbs, Session Replay, логи, версия релиза.
2. **Сузить область.** Бинарный поиск: по коду (отключать половины), по времени (`git bisect`), по данным (какое поле ломает), по окружению (только Safari? только при медленной сети?).
3. **Гипотеза → эксперимент.** Сформулировать, что должно наблюдаться, если гипотеза верна, и проверить. Одна переменная за раз.
4. **Исправить причину**, а не симптом (не `?.` везде, а почему пришёл `undefined`).
5. **Регрессионный тест**, затем поиск похожих мест.
6. **Поделиться**: описание в PR, постмортем для инцидентов.

💡 **На собеседовании:** расскажите про один реальный баг по этой схеме — это сильнее перечисления инструментов.

### Sources: breakpoints

- **Условный breakpoint** — останов только при `user.id === 42`.
- **Logpoint** — лог без изменения кода и без пересборки.
- **DOM breakpoints** — останов при изменении поддерева, атрибутов или удалении узла: «кто меняет этот элемент?».
- **XHR/fetch breakpoints** — останов при запросе на URL с подстрокой.
- **Event listener breakpoints** — на `click`, `keydown`, `message`.
- **Pause on caught/uncaught exceptions.**
- **Ignore list** — не заходить в код `node_modules` и фреймворков при пошаговой отладке.
- `debugger;` в коде, `console.trace()`, `console.table()`, `$0` (выбранный элемент), `monitorEvents($0)`, `queryObjects(Constructor)`.

### Network

Фильтры, **throttling** (медленная сеть, офлайн), **блокировка запросов** (что будет, если CDN недоступен), **local overrides** (подменить ответ или файл на продакшене без деплоя), копирование запроса как `fetch`/cURL, Initiator (кто сделал запрос), заголовки кэша и CORS, тайминги (DNS, TLS, TTFB).

### Performance и рендеринг

Запись профиля взаимодействия: долгие задачи, кто их вызвал (flame chart), Layout/Recalculate Style (forced reflow), Paint. CPU throttling 4–6x для имитации среднего телефона. Rendering-панель: подсветка перерисовок, сдвигов раскладки (CLS), FPS. Профайлеры фреймворков: React DevTools Profiler («почему компонент перерендерился»), Vue DevTools.

### Память

```text
Признаки утечки: память растёт после повторения одного и того же сценария
(открыть/закрыть модалку 10 раз) и не освобождается после сборки мусора.

1. Memory → Heap snapshot (исходное состояние)
2. Повторить сценарий N раз
3. Heap snapshot → Comparison: какие объекты прибавились
4. Retainers: цепочка ссылок, которая держит объект
```

Частые причины: неотписанные обработчики и подписки, таймеры, замыкания в глобальных кэшах, detached DOM-узлы (удалены из документа, но хранятся в переменной), растущие Map без ограничения. Инструмент «Detached elements» в DevTools.

### Отладка в особых условиях

- **Мобильные**: Chrome remote debugging по USB (`chrome://inspect`), Safari Web Inspector для iOS, эмуляция в DevTools (не заменяет реальное устройство).
- **Продакшен**: sourcemaps в Sentry; локально — подключить sourcemap через DevTools вручную; feature flag для подробного логирования конкретному пользователю.
- **SSR и hydration mismatch**: сравнить HTML с сервера (View Source) и результат клиента; React и Vue указывают элемент расхождения.
- **Node/SSR-код**: `node --inspect`, отладчик в VS Code.
- **Гонки**: искусственные задержки в MSW или через network throttling, логирование с временными метками и идентификаторами запросов.

## Вопросы с собеседований

<details><summary>Как вы ищете причину бага?</summary>

Воспроизвожу и собираю окружение, сужаю область бинарным поиском (код, коммиты через `git bisect`, данные, окружение), формулирую гипотезы и проверяю по одной в отладчике, исправляю причину, пишу регрессионный тест, проверяю похожие места и описываю решение.
</details>

<details><summary>Баг воспроизводится только у части пользователей. Ваши действия?</summary>

Найти общее у затронутых: браузер и версия, устройство, локаль и часовой пояс, роль и данные, флаги экспериментов, расширения, сеть, версия релиза (из мониторинга). Session Replay и breadcrumbs. Воспроизвести с теми же условиями; если не выходит — добавить таргетированное логирование.
</details>

<details><summary>Как найти утечку памяти в SPA?</summary>

Повторять сценарий и смотреть рост памяти; сравнить heap snapshots до и после; по retainers найти, что держит объекты; проверить отписки, таймеры, detached DOM, глобальные кэши. После исправления — повторить измерение.
</details>

<details><summary>Какие возможности DevTools вы используете, кроме console.log?</summary>

Условные breakpoints и logpoints, DOM- и XHR-breakpoints, ignore list, local overrides и блокировка запросов, throttling, Performance с CPU throttling, Rendering-подсветки, Memory snapshots, Coverage, Lighthouse, профайлеры фреймворков.
</details>

## Практика

1. Найдите с помощью DOM breakpoint, какой код меняет класс элемента на любом сайте.
2. Создайте утечку (обработчик на `window` в компоненте без отписки) и найдите её через heap snapshots.
3. Найдите регрессию в учебном репозитории через `git bisect run`.

Тест темы: [Отладка](../quizzes/quiz.html?id=17-debugging-git-team/01-debugging).

## Источники
- [Chrome DevTools: Debug JavaScript](https://developer.chrome.com/docs/devtools/javascript)
- [Chrome DevTools: Breakpoints](https://developer.chrome.com/docs/devtools/javascript/breakpoints)
- [Chrome DevTools: Fix memory problems](https://developer.chrome.com/docs/devtools/memory-problems)
- [Chrome DevTools: Local overrides](https://developer.chrome.com/docs/devtools/overrides)
- [React DevTools](https://react.dev/learn/react-developer-tools)
