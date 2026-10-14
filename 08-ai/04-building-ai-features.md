# AI-фичи в продукте на фронтенде

> ⏱ ~3 ч · 🎯 Спроектировать и реализовать AI-фичу на клиенте: стриминг с отменой и обработкой ошибок, UI чата и генеративного UI, tool calling, structured output с валидацией, безопасная архитектура (прокси, лимиты, защита от prompt injection), контроль стоимости и качества (evals).
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Написал стриминг на `fetch` + `ReadableStream` с `AbortController` без библиотек
- [ ] Понимаю, почему для чата обычно не используют `EventSource`
- [ ] Понимаю, что делает SDK уровня `useChat` под капотом
- [ ] Могу нарисовать безопасную архитектуру: клиент → свой бэкенд → провайдер
- [ ] Могу назвать 5 пунктов OWASP LLM Top 10, релевантных фронтенду

## Теория

### Архитектура: ключ никогда не на клиенте

```
Browser ──(сессия пользователя)──▶ Ваш бэкенд / BFF / edge-функция ──(API key)──▶ LLM-провайдер
          SSE / stream                 · аутентификация и авторизация
                                       · rate limit, квоты, бюджет на пользователя
                                       · системный промпт, инструменты, выбор модели
                                       · валидация входа/выхода, логирование, модерация
```

Почему не напрямую из браузера:
- ключ в бандле или в сетевых запросах **извлекается за минуты** — и тратит ваш бюджет;
- клиент может подменить системный промпт, модель, `max_tokens`, инструменты;
- нет точки для rate limiting, квот и аудита.

Исключения существуют (например, короткоживущие токены, выпущенные бэкендом для realtime-сессий у ряда провайдеров), но принцип тот же: долгоживущий ключ — только на сервере.

### Стриминг: SSE поверх fetch

LLM-провайдеры отдают ответ по токенам, обычно в формате **Server-Sent Events** (SSE): `text/event-stream`, события разделены пустой строкой, полезная нагрузка в строках `data: ...`.

Почему для чата обычно не `EventSource`:
- `EventSource` умеет только **GET** — нельзя отправить тело с историей сообщений;
- нельзя задать произвольные заголовки (например, `Authorization`);
- его автоматический реконнект для генерации вреден — повторный запрос = повторная (платная) генерация.

Поэтому — `fetch` (POST) + чтение `response.body` как `ReadableStream`.

🪤 Ловушка: границы сетевых чанков **не совпадают** с границами событий SSE и даже символов UTF-8. Нужен буфер и `TextDecoderStream` (или `TextDecoder` с `{ stream: true }`).

### Пример: клиентский стриминг на TypeScript

```ts
// shared/api/stream-chat.ts
export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export class ChatHttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ChatHttpError';
  }
}

type StreamEvent = { type: 'delta'; text: string } | { type: 'error'; message: string };

/**
 * Отправляет историю на свой бэкенд и возвращает асинхронный итератор текстовых дельт.
 * Протокол бэкенда (наш собственный): SSE, data: {"type":"delta","text":"..."} и data: [DONE].
 */
export async function* streamChat(
  messages: readonly ChatMessage[],
  signal: AbortSignal,
): AsyncGenerator<string, void, undefined> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ messages }),
    signal, // отмена прерывает и fetch, и чтение тела
  });

  if (!response.ok) {
    throw new ChatHttpError(response.status, await response.text().catch(() => ''));
  }
  if (!response.body) throw new Error('Response has no body');

  // TextDecoderStream корректно собирает многобайтные символы на границах чанков
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value.replaceAll('\r\n', '\n');

      // Событие SSE заканчивается пустой строкой; хвост без разделителя оставляем в буфере
      const rawEvents = buffer.split('\n\n');
      buffer = rawEvents.pop() ?? '';

      for (const rawEvent of rawEvents) {
        const data = rawEvent
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n');
        if (!data) continue; // комментарии-keepalive (": ping") и пустые события
        if (data === '[DONE]') return;

        const event = JSON.parse(data) as StreamEvent;
        if (event.type === 'error') throw new Error(event.message);
        yield event.text;
      }
    }
    // Соединение закрылось без [DONE] — ответ, вероятно, оборван
    throw new Error('Stream ended unexpectedly');
  } finally {
    await reader.cancel().catch(() => {}); // освобождаем соединение при раннем выходе
  }
}
```

### Хук чата с отменой и иммутабельными обновлениями

```tsx
// features/chat/model/use-chat-stream.ts
import { useCallback, useRef, useState } from 'react';
import { streamChat, type ChatMessage } from '@/shared/api/stream-chat';

type Status = 'idle' | 'streaming' | 'error';

export function useChatStream() {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const send = useCallback(async (text: string) => {
    controllerRef.current?.abort(); // новый запрос отменяет предыдущий
    const controller = new AbortController();
    controllerRef.current = controller;

    const history: ChatMessage[] = [...messages, { role: 'user', content: text }];
    // Оптимистично: сообщение пользователя и пустой ответ ассистента — сразу
    setMessages([...history, { role: 'assistant', content: '' }]);
    setStatus('streaming');
    setError(null);

    try {
      for await (const delta of streamChat(history, controller.signal)) {
        setMessages((prev) => {
          const last = prev.at(-1)!;
          return [...prev.slice(0, -1), { ...last, content: last.content + delta }];
        });
      }
      setStatus('idle');
    } catch (e) {
      if (controller.signal.aborted) {
        setStatus('idle'); // отмена пользователем — не ошибка; частичный ответ остаётся
        return;
      }
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, [messages]);

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  return { messages, status, error, send, stop } as const;
}
```

Что улучшить в продакшене (и проговорить на собеседовании):
- **частота ререндеров**: на быстрых моделях дельты приходят очень часто — копите в ref и сбрасывайте в state через `requestAnimationFrame` или throttle;
- **рендер Markdown** на каждом токене дорог и ломается на незакрытых конструкциях — используйте парсер, устойчивый к неполному вводу, мемоизируйте завершённые блоки;
- **идентификаторы сообщений** (`crypto.randomUUID()`) вместо индексов;
- **повтор** (`retry`) последнего сообщения и **редактирование** с обрезкой истории;
- **сохранение частичного ответа** при обрыве и пометка «ответ прерван».

### Серверная часть (прокси)

```ts
// app/api/chat/route.ts — Web-standard handler (Next.js App Router, Hono, edge-рантаймы)
import { z } from 'zod';

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(8_000) }))
    .min(1)
    .max(50),
});

// Провайдер-специфичный вызов скрыт за функцией (SDK провайдера или AI SDK)
declare function callModelStream(
  messages: z.infer<typeof Body>['messages'],
  signal: AbortSignal,
): AsyncIterable<string>;
declare function getUserId(req: Request): Promise<string | null>;
declare function checkRateLimit(userId: string): Promise<boolean>;

export async function POST(req: Request): Promise<Response> {
  const userId = await getUserId(req);
  if (!userId) return new Response('Unauthorized', { status: 401 });
  if (!(await checkRateLimit(userId))) return new Response('Too Many Requests', { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response('Bad Request', { status: 400 });

  const encoder = new TextEncoder();
  const send = (data: unknown) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // req.signal: клиент закрыл вкладку/нажал «стоп» → прерываем генерацию у провайдера
        for await (const text of callModelStream(parsed.data.messages, req.signal)) {
          controller.enqueue(send({ type: 'delta', text }));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('chat stream failed', { userId, error }); // детали — в лог
        controller.enqueue(send({ type: 'error', message: 'Generation failed' })); // клиенту — без деталей
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no', // nginx не должен буферизовать поток
    },
  });
}
```

🪤 Ловушка: прокси, CDN и сжатие могут **буферизовать** поток — пользователь видит весь ответ разом. Проверяйте всю цепочку (nginx, балансировщик, CDN) и заголовки.

🪤 Ловушка: HTTP-статус уже отправлен (200) к моменту ошибки в середине генерации — ошибку нужно передавать **событием в потоке**, а клиент должен его обрабатывать.

### AI SDK и аналоги (концептуально)

[AI SDK](https://ai-sdk.dev/) от Vercel — TypeScript-библиотека, унифицирующая работу с разными провайдерами. Концептуально состоит из:
- **ядра** (серверные функции генерации текста/объектов со стримингом и tool calling) — провайдер подключается адаптером, смена провайдера — смена одной строки;
- **UI-хуков** для React и других фреймворков (например, `useChat`): хранят список сообщений, статус запроса, ошибку, умеют остановить и повторить генерацию, разбирают поток в структурированные части сообщения (текст, вызовы инструментов, их результаты);
- **протокола потока** между сервером и хуком.

API SDK заметно менялся между мажорными версиями — на собеседовании говорите о концепциях («хук управляет состоянием сообщений и потоком, сервер отдаёт стрим в формате SDK»), а конкретику сверяйте с актуальной документацией.

💡 На собеседовании: «Я понимаю, что под капотом: POST с историей, SSE-поток с типизированными частями, парсинг, AbortController, иммутабельное обновление последнего сообщения. SDK экономит этот код и даёт единый формат для инструментов и мультипровайдерности — но я могу написать это и сам, и знаю, где он может мешать (кастомный протокол, нестандартный бэкенд)».

### Генеративный UI и tool calling на клиенте

**Генеративный UI** — модель отвечает не только текстом, но и вызовами инструментов, а клиент рендерит для них **ваши компоненты**: карточку товара, график, форму подтверждения. Модель не генерирует JSX — она выбирает инструмент и аргументы, UI остаётся под вашим контролем.

```tsx
// Сообщение как список типизированных частей (discriminated union)
type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'tool-call'; toolCallId: string; toolName: 'showProducts'; input: { query: string } }
  | { type: 'tool-result'; toolCallId: string; toolName: 'showProducts'; output: Product[] }
  | { type: 'tool-call'; toolCallId: string; toolName: 'confirmOrder'; input: { orderId: string } };

function MessagePartView({ part, onConfirm }: { part: MessagePart; onConfirm: (id: string, ok: boolean) => void }) {
  switch (part.type) {
    case 'text':
      return <Markdown text={part.text} />; // безопасный рендер, без raw HTML
    case 'tool-result':
      return <ProductGrid products={part.output} />;
    case 'tool-call':
      return part.toolName === 'confirmOrder'
        ? <ConfirmDialog onAnswer={(ok) => onConfirm(part.toolCallId, ok)} /> // human-in-the-loop
        : <Skeleton />; // инструмент выполняется на сервере — показываем загрузку
  }
}
```

Виды инструментов по месту выполнения:
- **серверные** — поиск, БД, внешние API (секреты на сервере);
- **клиентские** — геолокация, чтение состояния UI, навигация: клиент выполняет и отправляет результат обратно, цикл продолжается;
- **требующие подтверждения** — оплата, отправка, удаление: клиент показывает диалог, результатом инструмента становится решение пользователя.

### Structured output + zod

Для «не-чатовых» фич (извлечь поля из текста, сгенерировать фильтры из запроса «красные кроссовки до 5000», сгенерировать описание товара) нужен структурированный ответ:

```ts
import { z } from 'zod';

export const CatalogFilter = z.object({
  category: z.enum(['shoes', 'clothes', 'accessories']).nullable(),
  colors: z.array(z.string()).max(5),
  maxPrice: z.number().int().positive().nullable(),
});
export type CatalogFilter = z.infer<typeof CatalogFilter>;

// Сервер: схема (через JSON Schema) передаётся модели как формат ответа или параметр инструмента;
// SDK уровня AI SDK умеют принимать zod-схему напрямую.
// Клиент/сервер: результат ВСЕГДА валидируется повторно — схема гарантирует форму, а не смысл.
export function parseFilter(raw: unknown): CatalogFilter | null {
  const result = CatalogFilter.safeParse(raw);
  return result.success ? result.data : null;
}
```

Стриминг частичного объекта (поле за полем) полезен для длинных структур — UI заполняется по мере генерации; учтите, что частичный объект не проходит полную схему до завершения.

### UX-паттерны AI-интерфейсов

- **Состояния**: ожидание до первого токена (индикатор «думает»), стриминг, остановка, ошибка с повтором, оборванный ответ.
- **Управление**: кнопка «Стоп» всегда доступна во время генерации; повторить; редактировать запрос.
- **Скролл**: автоскролл вниз, только если пользователь уже внизу; не отбирать скролл при чтении.
- **Доступность**: `aria-live="polite"` для области ответа — но не объявлять каждый токен (объявлять завершённый ответ или порциями), фокус-менеджмент, клавиатура.
- **Доверие**: источники/цитаты, пометка AI-контента, кнопки обратной связи «полезно / не полезно» (данные для evals), дисклеймер для критичных доменов.
- **Оптимистичный UI**: сообщение пользователя появляется сразу; при ошибке — пометка «не отправлено» и повтор, а не исчезновение.

### Безопасность

Ключевые пункты [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) (версия 2025) в проекции на фронтенд:

| Риск | Что это | Что делает фронтенд/BFF |
|---|---|---|
| Prompt Injection | Инструкции во вводе пользователя или в данных (страница, документ, письмо — непрямой injection) меняют поведение модели | Не полагаться на промпт как на защиту; права инструментов = права пользователя; подтверждение действий; разделение данных и инструкций |
| Improper Output Handling | Вывод модели используется без обработки: XSS, SQL, команды | Рендер Markdown без raw HTML, санитизация (DOMPurify), никакого `eval`/`dangerouslySetInnerHTML` с выводом модели, осторожно со ссылками и картинками (утечка данных через URL изображения) |
| Sensitive Information Disclosure | Утечка персональных данных, секретов, чужих данных | Не отправлять лишнее в контекст, маскирование PII, разграничение доступа в RAG |
| System Prompt Leakage | Системный промпт извлекается пользователем | Не хранить секреты и логику авторизации в промпте |
| Excessive Agency | У модели слишком много прав/инструментов | Минимальный набор инструментов, read-only по умолчанию, human-in-the-loop |
| Unbounded Consumption | Злоупотребление ресурсами: стоимость, DoS | Rate limit, квоты и бюджет на пользователя, лимит длины входа и `max_tokens`, таймауты |

💡 На собеседовании: «Prompt injection не решается на 100% промптом. Защита — архитектурная: считать вывод модели недоверенным, давать инструментам права текущего пользователя, а необратимые действия — только с подтверждением».

### Стоимость

- Лимиты на вход (длина сообщения, число сообщений в истории) и выход (`max_tokens`).
- Обрезка/суммаризация истории, кэширование стабильного префикса промпта.
- Роутинг: дешёвая модель для простых запросов.
- Квоты на пользователя и тариф, алерты на аномальный расход.
- Метрика — **стоимость на успешную пользовательскую операцию**, а не на запрос.

### Оценка качества (evals)

LLM-фичу нельзя проверить одним ручным прогоном: ответы недетерминированы, а смена модели или промпта может незаметно ухудшить качество.

- **Набор примеров (golden set)**: реальные запросы + ожидаемые свойства ответа. Пополняется из продакшена (негативные оценки, обращения в поддержку).
- **Проверки**: детерминированные (валидна ли схема, есть ли ключевые сущности, нет ли запрещённого), LLM-as-a-judge по рубрике (с выборочной проверкой человеком), метрики retrieval для RAG.
- **В CI**: прогон evals при изменении промпта, модели, инструментов; порог качества как quality gate.
- **В продакшене**: доля положительных и отрицательных оценок, доля повторов/правок, отмены, латентность, стоимость, ошибки.
- **Тесты UI**: модель мокается (фиксированный поток событий), включая обрывы и ошибки в середине потока.

## Вопросы с собеседований

<details><summary>Как реализовать стриминг ответа LLM в UI?</summary>

Клиент делает POST на свой бэкенд с историей, бэкенд проксирует стрим провайдера в SSE. Клиент читает `response.body` через `getReader()` и `TextDecoderStream`, буферизует и режет события по пустой строке, парсит `data:`. Отмена — `AbortController`, сервер прокидывает `req.signal` провайдеру. Ошибки в середине потока — событием. Обновление state — иммутабельно, с батчингом (rAF/throttle). Не `EventSource`: только GET, без заголовков и с нежелательным авто-реконнектом.
</details>

<details><summary>Почему нельзя вызывать LLM API прямо из браузера с ключом?</summary>

Ключ извлекается из бандла/сети, злоумышленник тратит ваш бюджет; клиент может подменить системный промпт, модель и инструменты; нет точки для аутентификации, rate limit, квот, логирования. Правильно — BFF/edge-прокси с ключом в переменных окружения. Исключение — короткоживущие токены, выданные бэкендом, если провайдер это поддерживает.
</details>

<details><summary>Как обработать отмену генерации?</summary>

`AbortController` на клиенте: `abort()` прерывает fetch и чтение потока. Сервер слушает `request.signal` и отменяет запрос к провайдеру — иначе генерация (и оплата) продолжится. В UI отмена — не ошибка: частичный ответ сохраняется с пометкой. Новый запрос отменяет предыдущий, чтобы не было гонок.
</details>

<details><summary>Что такое генеративный UI?</summary>

Подход, при котором модель через tool calling выбирает, какой из ваших компонентов показать и с какими данными; клиент рендерит части сообщения по типу (текст, вызов инструмента, результат). Модель не генерирует код интерфейса — это безопасно и консистентно с дизайн-системой. Плюс клиентские инструменты и инструменты с подтверждением пользователя.
</details>

<details><summary>Как гарантировать структуру ответа модели?</summary>

Structured output по JSON Schema или tool calling со схемой; в TS-стеке — zod-схема как единый источник типов и валидации. Повторная валидация результата обязательна; при ошибке — повтор с текстом ошибки или фолбэк. Для длинных объектов — стриминг частичного объекта.
</details>

<details><summary>Что такое prompt injection и как от него защищается фронтенд-приложение?</summary>

Внедрение инструкций через ввод пользователя или через данные, которые читает модель (непрямой: веб-страница, документ, письмо). Полностью промптом не лечится. Меры: вывод модели — недоверенный (санитизация, без raw HTML, контроль ссылок и картинок), инструменты с правами пользователя и минимальным набором, подтверждение необратимых действий, разделение данных и инструкций в промпте, мониторинг. Секреты и авторизация — не в промпте.
</details>

<details><summary>Как безопасно рендерить Markdown из ответа модели?</summary>

Парсер без поддержки raw HTML или с санитизацией (DOMPurify), ссылки — с `rel="noopener noreferrer"` и проверкой протокола (не `javascript:`), осторожно с автозагрузкой изображений по URL из ответа (канал утечки данных через query-параметры). Код-блоки — с подсветкой без исполнения. Для производительности — мемоизация завершённых блоков.
</details>

<details><summary>Как тестировать AI-фичу?</summary>

Два уровня. UI: мокаем поток (фиксированные события, обрывы, ошибки в середине, отмена), проверяем состояния. Качество модели: evals — набор реальных примеров, детерминированные проверки + LLM-as-a-judge с калибровкой, прогон в CI при изменении промпта/модели, метрики продакшена (обратная связь, повторы, стоимость, латентность).
</details>

<details><summary>Как контролировать стоимость AI-фичи?</summary>

Лимиты входа/выхода, обрезка и суммаризация истории, кэширование промпта, роутинг на дешёвые модели, квоты и бюджет на пользователя, rate limit, алерты на расход. Считать стоимость на успешную операцию. Это пересекается с OWASP «Unbounded Consumption».
</details>

<details><summary>Почему ответ приходит не стримом, а целиком, хотя код стриминга правильный?</summary>

Буферизация по пути: nginx (`proxy_buffering`, заголовок `X-Accel-Buffering: no`), сжатие, CDN, некоторые серверлес-платформы без поддержки стриминга, middleware, читающие тело целиком. Диагностика — curl с `-N` к разным точкам цепочки.
</details>

## Практика

**1. Предскажите проблему.** Клиент делает `buffer.split('\n')` и парсит каждую строку как JSON сразу после `reader.read()` с `new TextDecoder().decode(value)`. Что сломается?

<details><summary>Решение</summary>

1) `decode` без `{ stream: true }` портит многобайтные символы (кириллица, эмодзи) на границе чанков. 2) Строка `data:` может прийти частично — `JSON.parse` упадёт. 3) Событие SSE может состоять из нескольких строк `data:`. Решение — `TextDecoderStream`, буфер, разделение по пустой строке, хвост в буфере.
</details>

**2. Спроектируйте AI-ассистента в админке интернет-магазина**, который умеет отвечать по заказам и делать возвраты.

<details><summary>Решение</summary>

BFF с аутентификацией; инструменты: `searchOrders` (read-only, с правами текущего сотрудника), `getOrder`, `refundOrder` (только через подтверждение в UI — генеративный компонент с суммой и кнопками; сервер проверяет права и лимиты независимо от модели). Данные заказов в контексте — минимально необходимые, PII маскируется. Вывод — санитизированный Markdown. Комментарии клиентов в заказах — потенциальный непрямой injection: они не дают прав, а `refundOrder` всё равно требует подтверждения. Лимиты и аудит-лог всех вызовов инструментов. Evals — набор типовых запросов сотрудников.
</details>

**3. Реализуйте батчинг обновлений** в `useChatStream`, чтобы state обновлялся не чаще одного раза за кадр.

<details><summary>Решение</summary>

```ts
const pendingRef = useRef('');
const frameRef = useRef<number | null>(null);

const flush = () => {
  frameRef.current = null;
  const chunk = pendingRef.current;
  pendingRef.current = '';
  if (!chunk) return;
  setMessages((prev) => {
    const last = prev.at(-1)!;
    return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
  });
};

const enqueue = (delta: string) => {
  pendingRef.current += delta;
  frameRef.current ??= requestAnimationFrame(flush);
};
// В цикле: enqueue(delta). По завершении/ошибке/отмене: cancelAnimationFrame + flush() — не потерять хвост.
```
</details>

## Источники
- [AI SDK](https://ai-sdk.dev/)
- [Anthropic Docs](https://docs.anthropic.com/)
- [Claude Docs](https://docs.claude.com/)
- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
