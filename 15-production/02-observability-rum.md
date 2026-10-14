# Наблюдаемость и RUM

> ⏱ ~3 ч · 🎯 Знать, как приложение работает у реальных пользователей: Core Web Vitals с атрибуцией, свои метрики, Long Animation Frames, SLO и алерты.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Различаю RUM и синтетику, лабораторные и полевые данные
- [ ] Собираю CWV через `web-vitals` с атрибуцией и сегментацией
- [ ] Использую `performance.mark/measure` для своих метрик
- [ ] Знаю Long Animation Frames API
- [ ] Могу сформулировать SLO для фронтенда
- [ ] Ответил вслух на вопросы ниже

## Теория

### RUM и синтетика

| | Синтетика (лаборатория) | RUM (поле) |
|---|---|---|
| Где | Lighthouse, WebPageTest, Lighthouse CI | браузеры реальных пользователей |
| Плюсы | воспроизводимо, до релиза, подробная диагностика | реальные устройства, сети, сценарии; INP только здесь |
| Минусы | не отражает реальную аудиторию | шумно, нужны объёмы и сегментация |

Нужны оба: синтетика ловит регрессии в PR, RUM показывает, что чувствуют пользователи. CrUX (Chrome UX Report) — полевые данные Google по вашему сайту, влияют на поиск.

### Core Web Vitals с атрибуцией

```ts
import { onCLS, onINP, onLCP } from 'web-vitals/attribution';

function send(metric) {
  const body = JSON.stringify({
    name: metric.name, // 'LCP' | 'INP' | 'CLS'
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    id: metric.id,
    page: location.pathname,
    release: __APP_VERSION__,
    // Что именно виновато: элемент LCP, скрипт и элемент для INP, сдвинувшийся элемент CLS
    attribution: metric.attribution,
  });
  // sendBeacon надёжно отправляет даже при закрытии вкладки
  navigator.sendBeacon('/rum', body);
}

onLCP(send);
onINP(send);
onCLS(send);
```

Пороги «хорошо» на 75-м перцентиле: LCP ≤ 2,5 с, INP ≤ 200 мс, CLS ≤ 0,1. Анализ — по p75 с сегментацией: тип устройства, сеть, страна, маршрут, релиз, залогинен ли пользователь. Среднее значение скрывает проблемы хвоста.

### Long Animation Frames (LoAF)

API `long-animation-frame` показывает кадры дольше 50 мс и **какие скрипты** в них работали (источник, функция, длительность). Это главный инструмент поиска причин плохого INP в поле: обработчик стороннего виджета, тяжёлый рендер, гидратация.

```js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    for (const script of entry.scripts) {
      report({ duration: entry.duration, source: script.sourceURL, fn: script.sourceFunctionName });
    }
  }
}).observe({ type: 'long-animation-frame', buffered: true });
```

### Свои метрики

Продуктовые моменты, которые CWV не видят: «время до интерактивной таблицы», «время открытия редактора», «длительность поиска».

```js
performance.mark('search:start');
await runSearch(query);
performance.mark('search:end');
const { duration } = performance.measure('search', 'search:start', 'search:end');
```

Element Timing (`elementtiming`) — когда отрисован ключевой элемент. Resource Timing — медленные API и ассеты. Server-Timing — разбивка времени ответа сервера в заголовке.

### Что ещё наблюдать

- Ошибки JS и API (доля, по релизам) — см. [ошибки и мониторинг](01-errors-and-monitoring.md).
- Неуспешные загрузки чанков и ресурсов.
- Бизнес-воронки: старт оформления → оплата → успех.
- Rage clicks и dead clicks (часто из Session Replay).
- Использование памяти (`performance.measureUserAgentSpecificMemory` — только в cross-origin isolated контексте) для долгоживущих SPA.

### SLO и алерты

SLI — измеримый показатель («доля просмотров страницы с LCP ≤ 2,5 с»), SLO — цель («≥ 90% за 28 дней»), бюджет ошибок — допустимое нарушение. Алертить на нарушение бюджета и резкие регрессии после релиза, а не на каждый выброс. Дашборд по командам и маршрутам — у каждой метрики есть владелец.

### Приватность

Не отправлять PII (email, телефон, содержимое полей), обрезать query-параметры с токенами, уважать согласие пользователя (consent), семплировать.

## Вопросы с собеседований

<details><summary>Опишите стратегию наблюдаемости фронтенда за пределами отслеживания ошибок.</summary>

RUM с CWV и атрибуцией, сегментацией и p75; LoAF для причин плохого INP; свои метрики ключевых операций; сетевые метрики и ошибки загрузки ресурсов; бизнес-воронки; SLO с бюджетами ошибок и алертами на регрессии после релизов; синтетика в CI как ранний сигнал; дашборды с владельцами.
</details>

<details><summary>Чем полевые данные отличаются от лабораторных и почему Lighthouse показывает 100, а пользователи жалуются?</summary>

Lighthouse — одна загрузка на эмулированном устройстве без взаимодействий. Пользователи — слабые телефоны, плохие сети, долгие сессии, кэш, расширения, взаимодействия (INP). Решение — RUM с сегментацией по устройствам и маршрутам.
</details>

<details><summary>Как найти, что ухудшает INP у реальных пользователей?</summary>

`web-vitals/attribution` (целевой элемент, тип события, фазы: задержка ввода, обработка, отрисовка) + Long Animation Frames (какие скрипты выполнялись в долгом кадре). Агрегировать по источникам скриптов и маршрутам, затем воспроизвести локально в Performance-панели.
</details>

## Практика

1. Подключите `web-vitals/attribution` и отправляйте метрики через `sendBeacon` на тестовый эндпоинт.
2. Напишите наблюдатель LoAF и найдите самый тяжёлый скрипт на своём сайте.
3. Сформулируйте 3 SLO для своего продукта.

Тест темы: [Наблюдаемость и RUM](../quizzes/quiz.html?id=15-production/02-observability-rum).

## Источники
- [web.dev: Web Vitals](https://web.dev/articles/vitals)
- [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals)
- [Chrome for Developers: Long Animation Frames API](https://developer.chrome.com/docs/web-platform/long-animation-frames)
- [MDN: Performance.measure()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure)
- [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
