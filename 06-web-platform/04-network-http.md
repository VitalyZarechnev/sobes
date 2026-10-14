# Сеть и HTTP

> ⏱ ~5 ч · 🎯 Senior/lead объясняет, откуда берутся задержки (RTT, handshakes, HOL blocking), проектирует стратегию HTTP-кэширования и CDN, без ошибок рассуждает о CORS и cookies, выбирает протокол взаимодействия (REST/GraphQL/gRPC-web/tRPC, WebSocket/SSE) и пишет надёжный сетевой слой (отмена, ретраи, дедупликация).
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Рисую по памяти TLS 1.3 handshake и считаю RTT до первого байта
- [ ] Могу настроить `Cache-Control` для HTML, хэшированных ассетов и API
- [ ] Знаю условия «простого» CORS-запроса и все заголовки preflight
- [ ] Написал fetch-обёртку с таймаутом, ретраями и дедупликацией

## Теория

### Транспорт: TCP, UDP, DNS, TLS

**TCP** — надёжный упорядоченный поток: 3-way handshake (SYN, SYN-ACK, ACK) = 1 RTT, контроль перегрузки (slow start: начальное окно ~10 сегментов ≈ 14 КБ — отсюда совет «критичное содержимое в первые 14 КБ»), повторные передачи. Потеря одного пакета задерживает все последующие байты потока — **head-of-line blocking на уровне TCP**.

**UDP** — датаграммы без гарантий и без handshake; на нём строят QUIC, WebRTC, DNS.

**DNS**: рекурсивный резолвер → root → TLD → авторитативный сервер; кэши на всех уровнях с TTL. Типы записей: A/AAAA, CNAME, HTTPS/SVCB (подсказка о HTTP/3 и ECH). DoH/DoT — шифрованный DNS.

**TLS 1.3**: 1 RTT. ClientHello (с key share для ECDHE, поддерживаемыми шифрами, SNI, ALPN) → ServerHello + key share + сертификат + Finished (всё, кроме ServerHello, уже зашифровано) → клиент может сразу слать данные. **0-RTT** (early data) при возобновлении сессии — но уязвим к replay, поэтому только для идемпотентных запросов. TLS 1.2 требовал 2 RTT.

Итого до первого байта на новом соединении: DNS + TCP (1 RTT) + TLS 1.3 (1 RTT) + запрос (1 RTT) = ~3 RTT. На мобильной сети с RTT 100+ мс — это 300+ мс до TTFB без учёта сервера.

### HTTP/1.1 vs HTTP/2 vs HTTP/3

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Транспорт | TCP | TCP | QUIC поверх UDP |
| Формат | Текст | Бинарные фреймы | Бинарные фреймы |
| Параллелизм | 1 запрос за раз на соединение, ~6 соединений на хост | Мультиплексирование потоков в одном соединении | Мультиплексирование, потоки независимы |
| HOL blocking | На уровне HTTP | Устранён на HTTP, остался на TCP | Устранён (потеря пакета блокирует только свой поток) |
| Заголовки | Без сжатия | HPACK | QPACK |
| Handshake | TCP + TLS | TCP + TLS (ALPN `h2`) | 1 RTT (транспорт и TLS 1.3 совмещены), 0-RTT |
| Прочее | keep-alive, pipelining (не работал) | Приоритеты (перепридуманы: `Priority` заголовок, RFC 9218), server push (убран из браузеров) | Connection migration (смена Wi-Fi → LTE без разрыва по Connection ID) |

Следствия для фронтенда: доменный шардинг и спрайты/склейка — антипаттерны HTTP/1-эпохи; при HTTP/2+ много мелких файлов приемлемо, но **не бесконечно** (оверхед на запрос, компрессия хуже на мелких файлах) — разумный code splitting. Обнаружение HTTP/3: `Alt-Svc` заголовок или DNS HTTPS-запись; первый визит может пойти по h2.

### Методы, идемпотентность, коды

| Метод | Безопасный | Идемпотентный | Тело |
|---|---|---|---|
| GET, HEAD, OPTIONS | да | да | нет |
| PUT, DELETE | нет | да | PUT — да |
| POST | нет | нет | да |
| PATCH | нет | не обязательно | да |

Идемпотентность — повтор даёт тот же **эффект на сервере** (ответ может отличаться: второй DELETE → 404). Это определяет, **можно ли автоматически ретраить**. Для POST — `Idempotency-Key` заголовок (паттерн Stripe; IETF draft) — сервер дедуплицирует повторы.

Коды: `200`, `201 Created` (+`Location`), `204 No Content`, `206 Partial Content` (Range), `301/308` (постоянный; 308 сохраняет метод), `302/307` (временный; 307 сохраняет метод), `303 See Other` (после POST → GET), `304 Not Modified`, `400`, `401` (не аутентифицирован), `403` (нет прав), `404`, `409 Conflict`, `412 Precondition Failed` (If-Match), `422`, `429 Too Many Requests` (+`Retry-After`), `500`, `502`, `503` (+`Retry-After`), `504`.

### HTTP-кэширование

Два уровня: **свежесть** (можно отдать без запроса к серверу) и **ревалидация** (спросить «изменилось ли?» → `304`).

```http
Cache-Control: max-age=31536000, immutable        # /assets/app.3f9a1c.js — хэш в имени
Cache-Control: no-cache                            # index.html — всегда ревалидировать
ETag: "abc123"                                     # ответ
If-None-Match: "abc123"                            # повторный запрос → 304 без тела
Cache-Control: public, max-age=60, stale-while-revalidate=600   # API/лента
Cache-Control: private, no-store                   # персональные/чувствительные данные
Vary: Accept-Encoding, Accept-Language
```

- `no-cache` — **можно** хранить, но **нужно** ревалидировать перед использованием. `no-store` — не хранить вообще. Частая путаница!
- `max-age` — для браузера, `s-maxage` — для shared-кэшей (CDN), `private` — только браузер, `public` — можно CDN даже с `Authorization`.
- `immutable` — не ревалидировать даже при reload.
- `stale-while-revalidate=N` — N секунд после истечения можно отдать устаревшее мгновенно и обновить в фоне. `stale-if-error` — отдавать устаревшее при 5xx.
- Валидаторы: `ETag` (сильный/слабый `W/`) с `If-None-Match`; `Last-Modified` с `If-Modified-Since` (точность — секунда).
- Без `Cache-Control`, но с `Last-Modified` браузер применяет **эвристическое кэширование** (~10% от возраста) — причина «почему у пользователя старая версия».
- `Vary` — ключ кэша включает указанные заголовки; `Vary: *` или `Vary: Cookie` фактически убивают кэш на CDN.

💡 На собеседовании — стратегия деплоя SPA: «HTML — `no-cache` (короткий/ревалидация), ассеты с content-hash — `max-age=1y, immutable`. Новый деплой = новый HTML со ссылками на новые хэши. Старые чанки держим на CDN какое-то время, чтобы открытые вкладки не ловили 404 на lazy-чанках (+ обработка `ChunkLoadError` с перезагрузкой)».

### CDN

Edge-кэш рядом с пользователем → меньше RTT, offload origin, TLS termination, HTTP/3, сжатие (Brotli, zstd), оптимизация изображений, защита (WAF, DDoS). Ключ кэша (URL + Vary + выбранные куки/заголовки), инвалидация (purge по URL/тегам — surrogate keys), `s-maxage`/`CDN-Cache-Control`, origin shield. Edge-функции — персонализация, A/B, SSR на краю. Подводные камни: кэширование персонализированных ответов (утечка данных между пользователями!), `Set-Cookie` в кэшируемом ответе.

### CORS

Same-origin = схема + хост + порт. Браузер по умолчанию **не даёт JS читать** ответы cross-origin запросов (сам запрос при этом может уйти!). CORS — механизм, которым **сервер ослабляет** это ограничение.

**Простой запрос** (без preflight): метод GET/HEAD/POST; только CORS-safelisted заголовки (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type` с ограничениями, `Range`); `Content-Type` только `text/plain`, `multipart/form-data`, `application/x-www-form-urlencoded`; нет `ReadableStream` в теле и слушателей upload. Это то, что HTML-форма могла делать всегда.

Всё остальное (`PUT`, `DELETE`, `Content-Type: application/json`, `Authorization`, кастомные заголовки) → **preflight**:

```http
OPTIONS /api/items HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, PUT, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 7200
Vary: Origin
```

- С `credentials: 'include'` нельзя `Access-Control-Allow-Origin: *` — нужен конкретный origin + `Allow-Credentials: true`. Отражать `Origin` без allowlist = дыра.
- `Access-Control-Expose-Headers` — какие заголовки ответа JS может читать (по умолчанию только safelisted).
- `Access-Control-Max-Age` — кэш preflight (Chrome ограничивает 2 часами).
- `mode: 'no-cors'` — запрос уйдёт, но ответ будет opaque (нельзя прочитать) — не «обход CORS».
- Избежать preflight целиком: same-origin через reverse proxy/BFF (`/api` на том же домене).

CORS **не защищает сервер** — подробно в [06-security](06-security.md).

### Cookies

```http
Set-Cookie: session=abc; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600
Set-Cookie: __Host-id=xyz; Path=/; Secure; HttpOnly; SameSite=Strict
Set-Cookie: widget=1; Secure; SameSite=None; Partitioned
```

- `HttpOnly` — недоступна из `document.cookie` (защита от кражи при XSS, но не от действий от имени пользователя).
- `Secure` — только по HTTPS. `Domain` — расширяет на поддомены (без него — host-only, безопаснее). `Path` — не граница безопасности.
- `SameSite`: `Strict` — не отправляется ни в каких cross-site запросах (даже переход по ссылке с другого сайта — пользователь «разлогинен» в первом запросе); `Lax` (дефолт в Chrome) — отправляется при top-level GET-навигации, но не в subresource/POST/iframe; `None` — всегда, требует `Secure`. **Site ≠ origin**: site = схема + eTLD+1, поэтому `a.example.com` и `b.example.com` — same-site.
- Префиксы `__Host-` (Secure, Path=/, без Domain) и `__Secure-` — защищают от перезаписи с поддомена или по HTTP.
- `Partitioned` (CHIPS) — сторонняя кука, разделённая по top-level сайту: виджет на `a.com` и `b.com` получает разные куки. Ответ на ограничение third-party cookies (Safari/Firefox блокируют; Chrome в 2024–2025 отказался от полного отключения в пользу пользовательского выбора, но строить на 3P cookies не стоит).
- Лимиты ~4 КБ на куку; куки едут в **каждом** запросе на домен — раздувают заголовки (держите статику на cookieless-домене или следите за размером).

### API-стили: REST vs GraphQL vs gRPC-web vs tRPC

| | REST | GraphQL | gRPC-web / Connect | tRPC |
|---|---|---|---|---|
| Контракт | OpenAPI (опц.) | Схема (строгая) | Protobuf | TS-типы сервера |
| Over/under-fetching | Есть | Решено клиентом | Есть | Есть |
| HTTP-кэш / CDN | Отлично (GET) | Плохо (POST; нужны persisted queries + GET) | Плохо | Средне |
| Типобезопасность | Через кодоген | Через кодоген | Кодоген | Нативная, без кодогена |
| Сложность | Низкая | Высокая (N+1, сложность запросов, безопасность) | Средняя, бинарный формат | Низкая, но только TS-монорепо |
| Когда | Публичные API, кэшируемые ресурсы | Много клиентов с разными нуждами, агрегатор доменов | Микросервисы на gRPC, стриминг | Fullstack TS, один владелец клиента и сервера |

💡 Lead-ответ: выбор зависит от потребителей и организации — публичный API → REST+OpenAPI; федерация данных для нескольких фронтов → GraphQL (с persisted queries, ограничением глубины/сложности); TS-монорепо с одной командой → tRPC; gRPC-экосистема бэкенда → Connect/gRPC-web или BFF.

### Реалтайм: polling, long polling, SSE, WebSocket

| | Short polling | Long polling | SSE (`EventSource`) | WebSocket |
|---|---|---|---|---|
| Направление | клиент → сервер | сервер → клиент (эмуляция) | сервер → клиент | двунаправленно |
| Протокол | HTTP | HTTP | HTTP (`text/event-stream`) | Свой поверх TCP после `Upgrade` (или HTTP/2 extended CONNECT) |
| Реконнект | — | вручную | **встроенный** + `Last-Event-ID` | вручную (backoff, heartbeat) |
| Через прокси/CDN | да | да | да, но буферизация может мешать | иногда проблемы |
| Данные | любые | любые | только текст (UTF-8) | текст и бинарь |
| Ограничения | лишний трафик | держит соединение | 6 соединений на домен в HTTP/1.1 (в HTTP/2 — нет) | stateful, сложное масштабирование (sticky sessions, pub/sub) |

Выбор: уведомления, ленты, стриминг LLM-ответов → **SSE** (или `fetch` со стримингом `ReadableStream`); чаты, совместное редактирование, игры → **WebSocket**; редкие обновления → polling. WebTransport (HTTP/3) — перспективная альтернатива с несколькими потоками и датаграммами.

### fetch, AbortController, ретраи, дедупликация

- `fetch` резолвится на **любом** HTTP-ответе, включая 404/500 — проверяйте `response.ok`. Реджект — только сетевая ошибка, CORS, отмена.
- `AbortController` — отмена; `AbortSignal.timeout(ms)` — таймаут; `AbortSignal.any([a, b])` — комбинирование.
- `keepalive: true` — запрос переживёт закрытие страницы (аналитика).
- `credentials`: `same-origin` (дефолт) / `include` / `omit`.
- Ретраи — только идемпотентных запросов (или с `Idempotency-Key`), на сетевые ошибки, 408/429/5xx; экспоненциальный backoff **с jitter** (иначе «стадо» после падения бэкенда); уважать `Retry-After`; ограничение попыток.
- Дедупликация — одинаковые параллельные GET разделяют один промис (так делают TanStack Query, SWR).

```ts
type RetryOptions = { retries?: number; baseMs?: number; timeoutMs?: number; signal?: AbortSignal };
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(signal.reason); }, { once: true });
  });

export async function fetchWithRetry(url: string, init: RequestInit = {}, opts: RetryOptions = {}) {
  const { retries = 3, baseMs = 300, timeoutMs = 10_000, signal } = opts;
  const method = (init.method ?? 'GET').toUpperCase();
  const idempotent = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS'].includes(method);

  for (let attempt = 0; ; attempt++) {
    const attemptSignal = AbortSignal.any([AbortSignal.timeout(timeoutMs), ...(signal ? [signal] : [])]);
    try {
      const res = await fetch(url, { ...init, signal: attemptSignal });
      if (res.ok || !RETRYABLE.has(res.status) || !idempotent || attempt >= retries) return res;
      const retryAfter = Number(res.headers.get('Retry-After')) * 1000;
      await sleep(retryAfter || backoff(attempt, baseMs), signal);
    } catch (err) {
      if (signal?.aborted || !idempotent || attempt >= retries) throw err; // пользовательская отмена — не ретраим
      await sleep(backoff(attempt, baseMs), signal);
    }
  }
}
// full jitter: случайная задержка в [0, base * 2^attempt]
const backoff = (attempt: number, base: number) => Math.random() * base * 2 ** attempt;

// Дедупликация in-flight GET
const inflight = new Map<string, Promise<unknown>>();
export function dedupedJson<T>(url: string): Promise<T> {
  const existing = inflight.get(url);
  if (existing) return existing as Promise<T>;
  const p = fetchWithRetry(url)
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<T>; })
    .finally(() => inflight.delete(url));
  inflight.set(url, p);
  return p;
}
```

🪤 Ловушка: race condition при быстрой смене фильтров — ответ на старый запрос приходит позже нового. Отменяйте предыдущий через `AbortController` или игнорируйте устаревшие ответы.

## Вопросы с собеседований

<details><summary>Чем HTTP/2 лучше HTTP/1.1, а HTTP/3 — HTTP/2?</summary>

HTTP/2: бинарные фреймы, мультиплексирование в одном TCP-соединении (нет лимита 6 соединений и HOL на уровне HTTP), HPACK. Но потеря TCP-пакета стопорит все потоки — HOL на TCP, на плохих сетях h2 может быть хуже h1 с 6 соединениями. HTTP/3 на QUIC (UDP): потоки независимы на транспорте, handshake транспорта и TLS совмещён (1 RTT, 0-RTT), connection migration, шифрование заголовков транспорта. Server push фактически мёртв — замена 103 Early Hints.
</details>

<details><summary>no-cache vs no-store vs max-age=0? Как кэшировать SPA?</summary>

`no-store` — не сохранять. `no-cache` — хранить, но ревалидировать каждый раз (`304` дешёвый). `max-age=0` — сразу устаревший, близко к `no-cache`, но с `stale-while-revalidate`/`stale-if-error` может отдаться. SPA: HTML — `no-cache` + ETag, хэшированные ассеты — `public, max-age=31536000, immutable`, API — по природе данных (`private`, короткий `max-age` + SWR) или `no-store` для чувствительного.
</details>

<details><summary>Когда браузер делает preflight? Как его избежать?</summary>

Если запрос не «простой»: метод не GET/HEAD/POST, не-safelisted заголовки (`Authorization`, `X-*`), `Content-Type: application/json`. Preflight — `OPTIONS` с `Access-Control-Request-Method/Headers`; ответ кэшируется `Access-Control-Max-Age`. Избежать: same-origin API через прокси/BFF, увеличить Max-Age. Нельзя «избегать» сменой JSON на `text/plain` ради обхода — это ослабляет CSRF-защиту.
</details>

<details><summary>SameSite=Lax vs Strict vs None; site vs origin?</summary>

Strict — не шлётся в любых cross-site контекстах, даже при переходе по ссылке. Lax — шлётся при top-level навигации безопасным методом (GET), не шлётся в fetch/iframe/картинках/POST-формах с другого сайта; дефолт. None — всегда, только с Secure (виджеты, SSO в iframe), для 3P — `Partitioned`. Site — схема + eTLD+1 (по Public Suffix List): поддомены одного домена — same-site, поэтому SameSite не защищает от атак с захваченного поддомена.
</details>

<details><summary>WebSocket или SSE?</summary>

SSE — односторонний поток сервер→клиент поверх обычного HTTP: автоматический реконнект с `Last-Event-ID`, проще инфраструктура, работает через HTTP/2 мультиплексирование. WebSocket — двунаправленный, бинарный, низкие накладные расходы на сообщение, но свой протокол: реконнекты, heartbeats, авторизация (нет заголовков в браузерном API — токен в первом сообщении или кука), масштабирование через pub/sub. Уведомления/стриминг ответа LLM → SSE/fetch-stream; чат, коллаборация → WebSocket.
</details>

<details><summary>Как правильно ретраить запросы?</summary>

Только идемпотентные или с `Idempotency-Key`; только транзиентные ошибки (сеть, 408, 429, 502–504; 500 — осторожно); экспоненциальный backoff с jitter; `Retry-After`; лимит попыток и общий дедлайн; не ретраить пользовательскую отмену; circuit breaker при массовых отказах. В UI — показывать состояние и давать ручной «повторить».
</details>

<details><summary>REST, GraphQL, tRPC — что выберете?</summary>

Зависит от потребителей. REST — простота, HTTP-кэш и CDN, публичность. GraphQL — когда много клиентов с разными потребностями и надо агрегировать данные; цена — сложность сервера (DataLoader против N+1), кэширование (нормализованный клиентский кэш, persisted queries), безопасность (лимиты глубины/стоимости). tRPC — end-to-end типы без кодогена в TS-монорепо; не годится для публичного API и других языков. gRPC-web — когда бэкенд на gRPC, нужен прокси (Envoy) или Connect.
</details>

<details><summary>Что происходит при fetch на 500? А при CORS-ошибке?</summary>

На 500 промис резолвится с `response.ok === false` — надо проверить вручную. При CORS-ошибке промис реджектится `TypeError: Failed to fetch` без подробностей (детали только в консоли) — JS намеренно не узнаёт причину, чтобы не утекала информация о чужих серверах. При этом сам запрос мог дойти до сервера и выполниться.
</details>

<details><summary>Почему важен RTT больше, чем пропускная способность?</summary>

Для веба (много небольших ресурсов) задержка доминирует: каждый новый origin — DNS + TCP + TLS, slow start TCP ограничивает первые окна, цепочки зависимостей (HTML → CSS → шрифт) умножают RTT. Поэтому: меньше origin-ов, preconnect, CDN ближе к пользователю, HTTP/3, 103 Early Hints, inline критичного, устранение цепочек запросов (waterfall).
</details>

<details><summary>Что такое ETag и как он связан с оптимистичной блокировкой?</summary>

ETag — версия ресурса. Для кэша: `If-None-Match` → `304`. Для конкурентной записи: клиент отправляет `PUT` с `If-Match: "v5"`; если ресурс уже изменён, сервер отвечает `412 Precondition Failed` — защита от lost update без блокировок.
</details>

## Практика

**Задача 1.** Сколько RTT до получения первого байта HTML при первом визите по HTTPS через HTTP/2 и через HTTP/3 (DNS в кэше нет, 1 RTT)?
<details><summary>Решение</summary>

HTTP/2 (TLS 1.3): DNS 1 + TCP 1 + TLS 1 + HTTP 1 = 4 RTT. HTTP/3: DNS 1 + QUIC/TLS 1 + HTTP 1 = 3 RTT (при возобновлении с 0-RTT — 2). Но для первого визита браузер обычно ещё не знает про h3 (если нет DNS HTTPS-записи) и идёт по h2.
</details>

**Задача 2.** Почему этот запрос шлёт preflight и падает, хотя сервер отвечает `Access-Control-Allow-Origin: *`?
```ts
fetch('https://api.other.com/me', { credentials: 'include', headers: { 'Content-Type': 'application/json' } });
```
<details><summary>Решение</summary>

`Content-Type: application/json` не safelisted → preflight. С `credentials: 'include'` wildcard `*` запрещён (и в `Allow-Origin`, и в `Allow-Headers`). Нужно: `Access-Control-Allow-Origin: https://app.example.com` (из allowlist), `Access-Control-Allow-Credentials: true`, `Access-Control-Allow-Headers: content-type`, `Vary: Origin`. Плюс кука должна быть `SameSite=None; Secure`, если сайты разные.
</details>

**Задача 3.** Реализуйте поиск с подсказками: дебаунс, отмена предыдущего запроса, без race condition.
<details><summary>Решение</summary>

```ts
export function createSearch(onResult: (items: string[]) => void, delay = 250) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;

  return (query: string) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      controller?.abort();                        // отменяем предыдущий — старый ответ не перетрёт новый
      controller = new AbortController();
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        onResult(await res.json());
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error('suggest failed', e);
      }
    }, delay);
  };
}
```
</details>

## Источники
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
- https://web.dev/articles/http-cache
- https://web.dev/articles/samesite-cookies-explained
- https://developer.chrome.com/docs/privacy-sandbox/chips/
- https://hpbn.co/
- https://www.rfc-editor.org/rfc/rfc9110
- https://www.rfc-editor.org/rfc/rfc9114
- https://www.rfc-editor.org/rfc/rfc5861
- https://learn.javascript.ru/fetch
- https://learn.javascript.ru/fetch-crossorigin
- https://learn.javascript.ru/fetch-abort
- https://learn.javascript.ru/cookie
- https://learn.javascript.ru/websocket
- https://learn.javascript.ru/server-sent-events
- https://learn.javascript.ru/long-polling
