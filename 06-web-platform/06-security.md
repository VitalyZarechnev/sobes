# Безопасность фронтенда

> ⏱ ~5 ч · 🎯 Senior/lead распознаёт XSS/CSRF/clickjacking в коде на ревью, настраивает строгую CSP и заголовки безопасности, принимает архитектурное решение о хранении токенов (BFF vs токены в браузере) и управляет рисками цепочки поставок npm.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разобрал примеры кода руками
- [ ] Ответил вслух на вопросы ниже
- [ ] Решил практические задачи
- [ ] Различаю stored / reflected / DOM XSS и знаю опасные sinks
- [ ] Могу написать strict CSP с nonce и `strict-dynamic` и объяснить report-only rollout
- [ ] Объясняю Authorization Code + PKCE и паттерн BFF
- [ ] Знаю, чем защищаться от supply chain атак в npm

## Теория

### Модель угроз и OWASP Top 10

OWASP Top 10 (2021; редакция 2025 сохраняет ядро): A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection (сюда входит XSS), A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable and Outdated Components, A07 Identification and Authentication Failures, A08 Software and Data Integrity Failures (supply chain, CI/CD), A09 Logging and Monitoring Failures, A10 SSRF. В редакции 2025 supply chain выделена отдельной категорией (Software Supply Chain Failures), добавлена обработка исключительных ситуаций.

Главный принцип фронтенда: **клиент — недоверенная среда**. Любая проверка на клиенте — UX, авторизация — только на сервере. Скрытая кнопка «Удалить» не защищает endpoint.

### XSS

Выполнение чужого JS в контексте вашего origin: кража данных, действия от имени пользователя, чтение токенов из storage, фишинг на вашем домене.

| Тип | Где payload | Пример |
|---|---|---|
| **Stored** | В БД, отдаётся всем | Комментарий `<img src=x onerror=...>` |
| **Reflected** | В запросе, отражается в ответе сервера | `/search?q=<script>...` в серверном шаблоне |
| **DOM-based** | Только на клиенте: source → sink | `el.innerHTML = location.hash.slice(1)` |

Опасные **sinks**: `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `setTimeout(string)`, `element.setAttribute('on*')`, `href`/`src` с `javascript:`, `iframe.srcdoc`, `Range.createContextualFragment`, jQuery `$(html)`.

Фреймворки (React, Vue, Angular) экранируют интерполяцию по умолчанию. Дыры остаются:
- `dangerouslySetInnerHTML`, `v-html`, `[innerHTML]` (Angular санитизирует, но `bypassSecurityTrust*` — нет);
- **URL-атрибуты**: `<a href={userUrl}>` с `javascript:alert(1)` (React 19 блокирует `javascript:` URL, но Vue и старые версии — нет; проверяйте протокол);
- SSR: сериализация состояния в `<script>window.__STATE__ = ${JSON.stringify(data)}</script>` — строка `</script><script>...` вырвется. Экранируйте `<` как `<` (serialize-javascript, devalue);
- шаблоны вне фреймворка, markdown-рендеры, SVG-загрузки (SVG может содержать скрипт — отдавать с `Content-Disposition: attachment` или с отдельного домена);
- prototype pollution → гаджеты в библиотеках → XSS.

```ts
// Защита URL: allowlist протоколов
function safeUrl(input: string): string {
  try {
    const url = new URL(input, location.origin);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : 'about:blank';
  } catch {
    return 'about:blank';
  }
}
```

### Санитизация

Если нужно рендерить пользовательский HTML — **санитизировать allowlist-ом**: DOMPurify (де-факто стандарт). Никогда не писать свои регэкспы — mXSS (mutation XSS) использует особенности перепарсинга браузером.

```ts
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
container.innerHTML = clean;
```

**Sanitizer API** (`Element.setHTML()`, `Document.parseHTMLUnsafe()`): стандартизованный санитайзер в браузере; `setHTML` безопасен по умолчанию. Поддержка появляется (Firefox, Chromium) — проверяйте Baseline перед использованием без фолбэка.

Экранирование зависит от **контекста**: HTML-текст, атрибут, URL, JS-строка, CSS — разные правила. Санитизация на входе (при сохранении) ненадёжна — правильнее кодировать на выходе по контексту.

### CSP (Content Security Policy)

Второй эшелон: даже если инъекция случилась, браузер не выполнит скрипт без разрешения.

**Strict CSP** (рекомендация Google/OWASP) — nonce или hash вместо allowlist доменов (allowlist обходят через JSONP и гаджеты на разрешённых CDN):

```http
Content-Security-Policy:
  script-src 'nonce-R4nd0m' 'strict-dynamic' https: 'unsafe-inline';
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'self';
  require-trusted-types-for 'script';
  report-to csp-endpoint
```

- `nonce` — случайный на **каждый ответ** (кэшируемый HTML с nonce = бессмысленный nonce; для SSG — hash).
- `'strict-dynamic'` — скрипт с nonce может грузить другие скрипты (бандлеры, лоадеры); allowlist и `'unsafe-inline'` при этом игнорируются браузерами, поддерживающими CSP3 — они оставлены как фолбэк для старых.
- `base-uri 'none'` — против подмены `<base>`; `object-src 'none'` — плагины.
- `frame-ancestors` — защита от clickjacking (заменяет `X-Frame-Options`).
- Rollout: сначала `Content-Security-Policy-Report-Only` + сбор отчётов (`report-to`/`Reporting-Endpoints`), разбор шума (расширения браузера), затем enforce.
- `'unsafe-eval'` — избегать; инлайн-обработчики `onclick=""` не работают со strict CSP — это хорошо.

### Trusted Types

Закрывают DOM XSS на уровне типов: при `require-trusted-types-for 'script'` sinks (`innerHTML`, `eval`, `script.src`) принимают только объекты `TrustedHTML`/`TrustedScript`/`TrustedScriptURL`, созданные политиками. Строка → `TypeError`. Аудит сводится к коду политик.

```ts
const policy = trustedTypes.createPolicy('sanitize', {
  createHTML: (input) => DOMPurify.sanitize(input),
});
el.innerHTML = policy.createHTML(userHtml) as unknown as string;
// el.innerHTML = userHtml  → TypeError при включённых Trusted Types
```

Поддержка: Chromium давно, Safari и Firefox — с 2025–2026 (проверяйте). Полифилл и report-only режим позволяют внедрять постепенно.

### CSRF

Атакующий сайт заставляет браузер жертвы отправить запрос на ваш сайт **с куками жертвы** (форма с автосабмитом, `<img src>`). Атакующий не читает ответ, но действие выполняется.

Защита (в комбинации):
1. **SameSite=Lax/Strict** куки — основная защита сегодня; но не от same-site атак (захваченный поддомен) и не для GET-ручек с побочными эффектами (Lax отправляет при top-level GET → GET должен быть безопасным!).
2. **CSRF-токен**: synchronizer token (в сессии) или double-submit cookie (подписанный, привязанный к сессии).
3. **Проверка `Origin`/`Sec-Fetch-Site`** на сервере для изменяющих запросов (Fetch Metadata: `Sec-Fetch-Site: cross-site` → отклонить).
4. Требование custom-заголовка или `Content-Type: application/json` — вызывает preflight, который атакующий сайт не пройдёт (при правильном CORS).

Токен в `Authorization: Bearer` (не кука) — CSRF неприменим, но токен доступен XSS.

### Clickjacking

Ваш сайт загружен в невидимый iframe поверх приманки; пользователь кликает «Выиграть приз», а нажимает «Перевести». Защита: `Content-Security-Policy: frame-ancestors 'none'|'self'` (+ `X-Frame-Options: DENY` для старых браузеров), SameSite-куки (в cross-site iframe не уйдут при Lax/Strict). JS frame-busting ненадёжен.

### CORS — не защита

CORS — механизм **ослабления** Same-Origin Policy для **чтения** ответов браузерным JS. Он:
- не мешает запросу дойти до сервера и выполниться (простые запросы, формы);
- не применяется к curl, серверам, ботам, мобильным приложениям;
- не заменяет аутентификацию/авторизацию и CSRF-защиту.

Опасные конфигурации: отражение любого `Origin` с `Allow-Credentials: true` (любой сайт читает данные пользователя), `null` origin в allowlist (sandbox-iframe может его послать), регулярки вида `example.com$` без точки (пропустят `evil-example.com`).

### Хранение токенов: cookie vs localStorage

| | `localStorage`/память JS | `HttpOnly; Secure; SameSite` cookie |
|---|---|---|
| XSS-кража токена | Да — любой скрипт читает | Нет — JS не видит |
| XSS-использование сессии | Да | Да (запросы от имени пользователя изнутри страницы) |
| CSRF | Неприменимо (Bearer явно) | Нужен SameSite + токен/Origin-check |
| Cross-domain API | Просто | Нужен same-site/CORS с credentials |
| Время жизни | Пока не очистят | Управляется сервером |

XSS проигрывает при любом выборе, но кража долгоживущего токена (особенно refresh) — гораздо хуже кратковременной сессии, которую можно отозвать.

Современная рекомендация (OAuth 2.0 for Browser-Based Apps, IETF BCP): **BFF (Backend for Frontend)** — SPA общается только со своим бэкендом через HttpOnly-сессионную куку; BFF хранит токены и проксирует к API. Токены никогда не попадают в браузер. Альтернативы по убыванию безопасности: token-mediating backend; токены в браузере — access в памяти (короткий), refresh с ротацией и детекцией повторного использования, DPoP (привязка токена к ключу клиента).

### OAuth 2.0 / OIDC с PKCE в SPA

OAuth — **авторизация** (доступ к API), OIDC — слой **аутентификации** поверх (ID token, JWT с `sub`, `nonce`, userinfo). Implicit flow (токен в URL-фрагменте) **устарел** — утечки через историю, Referer, нет refresh. В OAuth 2.1 — только Authorization Code + PKCE.

PKCE (Proof Key for Code Exchange) защищает от перехвата authorization code:
1. Клиент генерирует `code_verifier` (случайная строка 43–128 символов), считает `code_challenge = BASE64URL(SHA256(verifier))`.
2. Редирект на `/authorize?response_type=code&client_id&redirect_uri&scope=openid&state&code_challenge&code_challenge_method=S256`.
3. Пользователь логинится, IdP редиректит с `?code&state`. Клиент проверяет `state` (CSRF при логине).
4. `POST /token` с `code` + `code_verifier`. Сервер проверяет хэш → выдаёт токены. Перехвативший `code` без `verifier` его не обменяет.

```ts
const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function createPkce() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  return { verifier, challenge }; // verifier — в sessionStorage до возврата с IdP
}
```

Проверять: `state`, `nonce` в ID token, точное совпадение `redirect_uri`, `iss` (mix-up атаки), не логировать токены, не класть их в URL.

### Supply chain атаки (npm)

Реальные кейсы: `event-stream` (2018, вредонос в зависимости), `ua-parser-js` (2021, угон аккаунта мейнтейнера), `node-ipc` (протестварь), polyfill.io (2024, домен CDN перекуплен — скрипт на 100k+ сайтах начал отдавать вредонос), волна угонов популярных пакетов через фишинг мейнтейнеров и самораспространяющийся червь Shai-Hulud (2025, кража токенов npm/GitHub в `postinstall`).

Векторы: typosquatting, dependency confusion (публичный пакет с именем внутреннего), угон аккаунта, вредоносные `install`-скрипты, компрометация CI.

Защита:
- lockfile в репозитории, `npm ci`/`pnpm install --frozen-lockfile` в CI;
- отключение lifecycle-скриптов (`ignore-scripts`; pnpm 10 по умолчанию не выполняет скрипты зависимостей, только из allowlist `onlyBuiltDependencies`);
- задержка на свежие версии (pnpm `minimumReleaseAge`, Renovate `minimumReleaseAge`) — большинство вредоносных версий снимают за часы-дни;
- scoped-пакеты и приватный registry с прокси для защиты от dependency confusion;
- аудит: `npm audit`, Socket, Snyk, Dependabot, OSV; SBOM;
- `npm publish --provenance` / trusted publishing (OIDC из CI без долгоживущих токенов), 2FA мейнтейнеров;
- минимизация зависимостей — каждая зависимость = доверие её автору и всем транзитивным;
- сторонние скрипты на странице (аналитика, чаты) — тот же риск: self-host, SRI, CSP, iframe-изоляция.

### SRI (Subresource Integrity)

```html
<script src="https://cdn.example.com/lib@4.2.0/lib.min.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```
Браузер сверит хэш и не выполнит изменённый файл. Работает только для **версионированных неизменяемых** файлов — для «живых» скриптов вроде полифилл-сервисов неприменимо (поэтому self-host).

### Заголовки безопасности

| Заголовок | Значение |
|---|---|
| `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | Только HTTPS, защита от SSL stripping |
| `Content-Security-Policy` | См. выше |
| `X-Content-Type-Options: nosniff` | Не угадывать MIME (против исполнения загруженных файлов как скриптов) |
| `Referrer-Policy: strict-origin-when-cross-origin` | Не утекают пути/параметры в чужие домены |
| `Permissions-Policy: camera=(), geolocation=()` | Отключить мощные API, в т.ч. для iframe |
| `Cross-Origin-Opener-Policy: same-origin` | Изоляция от `window.opener` (+ против XS-Leaks) |
| `Cross-Origin-Embedder-Policy: require-corp` | Вместе с COOP → `crossOriginIsolated` (SharedArrayBuffer, точные таймеры) |
| `Cross-Origin-Resource-Policy: same-origin` | Кто может встраивать ваш ресурс |
| `X-Frame-Options: DENY` | Устаревший аналог `frame-ancestors` |

`X-XSS-Protection` — убран из браузеров, ставить `0` или не ставить. `target="_blank"` уже подразумевает `noopener` в современных браузерах.

## Вопросы с собеседований

<details><summary>Какие бывают XSS, и защищает ли React от XSS полностью?</summary>

Stored, reflected, DOM-based. React экранирует текст в JSX, но не защищает: `dangerouslySetInnerHTML`, URL-атрибуты (`javascript:` — React 19 блокирует, но полагаться на это не стоит), прямой доступ к DOM через ref, SSR-сериализация состояния в `<script>`, сторонние библиотеки (markdown, редакторы), прототипное загрязнение. Многослойная защита: контекстное экранирование, DOMPurify, strict CSP, Trusted Types, HttpOnly-куки.
</details>

<details><summary>Как настроить CSP для SPA и не сломать прод?</summary>

Strict CSP: `script-src 'nonce-…' 'strict-dynamic'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors`. Для статического хостинга без nonce — hash-based (бандлеры генерируют). Внедрять через Report-Only, собирать отчёты, отфильтровать шум от расширений, разобрать инлайн-скрипты и сторонние теги, затем enforce. Отдельно — `require-trusted-types-for 'script'` в report-only.
</details>

<details><summary>Где хранить JWT в SPA?</summary>

Лучший вариант — нигде в браузере: BFF с HttpOnly-сессионной кукой (`__Host-`, Secure, SameSite=Lax/Strict), токены на сервере. Если токены в браузере — access в памяти (короткий), refresh в HttpOnly-куке на узком path или с ротацией и reuse detection; не в localStorage. Учесть: HttpOnly защищает от кражи, но не от использования сессии при XSS — значит, CSP и прочее остаются обязательными.
</details>

<details><summary>Что такое PKCE и зачем он в SPA?</summary>

SPA — публичный клиент, `client_secret` хранить нельзя. PKCE связывает запрос авторизации и обмен кода через одноразовый секрет: в `/authorize` идёт хэш, в `/token` — оригинал. Перехваченный code (через редирект, логи, вредоносное приложение с тем же URL-схемой) бесполезен. В OAuth 2.1 PKCE обязателен для всех клиентов, implicit flow удалён.
</details>

<details><summary>Как защититься от CSRF в 2025+? Достаточно ли SameSite?</summary>

SameSite=Lax по умолчанию закрывает большинство cross-site POST, но: не защищает от same-site атак (уязвимый поддомен), GET с побочными эффектами всё ещё уязвим, старые браузеры/исключения (Lax+POST 2-минутное окно в Chrome для кук без явного SameSite). Defence in depth: явный SameSite, проверка `Origin`/`Sec-Fetch-Site`, CSRF-токен для критичных операций.
</details>

<details><summary>Почему CORS не является защитой?</summary>

CORS ограничивает только чтение ответа браузерным JS другого origin. Запрос может выполниться (простые запросы), инструменты вне браузера его игнорируют. Защита сервера — аутентификация, авторизация на каждом endpoint, CSRF-защита, rate limiting. Неверный CORS (отражение Origin с credentials) — наоборот, создаёт уязвимость.
</details>

<details><summary>Как снизить риск supply chain атаки на фронтенд-проект?</summary>

Lockfile + frozen install в CI, запрет install-скриптов по умолчанию, задержка обновлений на свежие версии, ревью новых зависимостей (размер, мейнтейнеры, активность), сканеры (Socket/Snyk/Dependabot), приватный registry/scopes против dependency confusion, provenance и trusted publishing для своих пакетов, минимум прав у CI-токенов, SRI/self-host для CDN-скриптов, CSP как ограничитель ущерба.
</details>

<details><summary>Что такое Trusted Types и чем они лучше линтеров?</summary>

Браузерное принуждение: опасные DOM sinks принимают только типизированные значения, созданные зарегистрированными политиками. Линтер видит код проекта, Trusted Types — runtime, включая зависимости. Аудит безопасности сводится к нескольким политикам. Внедрение — report-only, затем enforce; фреймворки (Angular, Lit) поддерживают нативно.
</details>

<details><summary>Какие заголовки безопасности вы ставите по умолчанию?</summary>

HSTS (с preload после проверки поддоменов), CSP (strict + frame-ancestors), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` с отключением ненужного, COOP `same-origin` (или `same-origin-allow-popups` для OAuth-попапов), CORP. COEP — только если нужна cross-origin isolation.
</details>

<details><summary>Чем опасна сериализация состояния при SSR?</summary>

`JSON.stringify` не экранирует `</script>` и `<!--`: пользовательская строка в состоянии закроет тег и выполнит код — stored XSS через SSR. Нужно экранировать `<`, `>`, `&`, U+2028/2029 (serialize-javascript, devalue) или класть данные в `<script type="application/json">` с экранированием и читать через `JSON.parse(el.textContent)`.
</details>

## Практика

**Задача 1.** Найдите уязвимости:
```tsx
function Profile({ user }: { user: { name: string; site: string; bio: string } }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <a href={user.site}>Сайт</a>
      <div dangerouslySetInnerHTML={{ __html: user.bio }} />
    </div>
  );
}
```
<details><summary>Решение</summary>

`name` — безопасно (экранируется). `site` — возможен `javascript:` URL (React 19 его заблокирует, но Vue/старые версии — нет; и `data:` для фишинга) → `safeUrl()` с allowlist протоколов, плюс `rel="noopener noreferrer ugc"` для внешних. `bio` — stored XSS → `DOMPurify.sanitize(user.bio)` или рендер markdown через безопасный рендерер без HTML; плюс strict CSP как второй эшелон.
</details>

**Задача 2.** Сервер настроил CORS так. В чём проблема?
```ts
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
```
<details><summary>Решение</summary>

Отражается любой `Origin` вместе с credentials: любой сайт выполнит `fetch(api, { credentials: 'include' })` и прочитает данные залогиненного пользователя. Нужен allowlist точных origin-ов, `Vary: Origin`, credentials — только если реально нужны; без `Origin` — не ставить заголовки.
```ts
const ALLOWED = new Set(['https://app.example.com']);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Vary', 'Origin');
  next();
});
```
</details>

**Задача 3.** Спроектируйте аутентификацию для SPA (`app.example.com`) с API (`api.example.com`) и внешним IdP.
<details><summary>Решение</summary>

BFF на `app.example.com/bff`: выполняет Authorization Code + PKCE как confidential client (с секретом), хранит access/refresh на сервере (сессия в Redis), выдаёт браузеру `__Host-session` (HttpOnly, Secure, SameSite=Lax). SPA ходит в `/bff/api/*` same-origin (нет CORS и preflight), BFF подставляет `Authorization` и проксирует на `api.example.com`, обновляет токены. CSRF: SameSite + проверка `Origin`/`Sec-Fetch-Site` + кастомный заголовок на мутациях. Logout — отзыв токенов у IdP и удаление сессии. Плюс strict CSP, HSTS, короткие сессии с sliding expiration.
</details>

## Источники
- https://owasp.org/www-project-top-ten/
- https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
- https://web.dev/articles/strict-csp
- https://web.dev/articles/trusted-types
- https://web.dev/articles/fetch-metadata
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
- https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
- https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps
- https://datatracker.ietf.org/doc/html/rfc7636
- https://oauth.net/2.1/
- https://github.com/cure53/DOMPurify
- https://docs.npmjs.com/generating-provenance-statements
