# Аутентификация и авторизация

> ⏱ ~4 ч · 🎯 Спроектировать безопасный вход и сессии для SPA и SSR: где хранить токены, как работают OAuth 2.0/OIDC с PKCE, BFF, CSRF, обновление сессии, passkeys и проверки прав.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Различаю аутентификацию, авторизацию и их роль на фронтенде
- [ ] Сравниваю сессии на cookie и JWT, знаю атрибуты cookie
- [ ] Объясню Authorization Code + PKCE и паттерн BFF
- [ ] Понимаю CSRF и защиту SameSite + токен/проверка Origin
- [ ] Реализую обновление токена без гонок и синхронизацию между вкладками
- [ ] Знаю, что такое passkeys/WebAuthn
- [ ] Ответил вслух на вопросы ниже

## Теория

### Термины

- **Аутентификация** — кто ты: пароль, passkey, одноразовый код, вход через провайдера (SSO).
- **Авторизация** — что тебе можно: роли, права, владение ресурсом. Проверяется **на сервере для каждого запроса**; фронтенд лишь скрывает недоступный UI и обрабатывает 403.
- **Сессия** — состояние «пользователь вошёл»: ID сессии на сервере или самодостаточный токен.

### Сессия на cookie vs JWT

| | Серверная сессия (ID в cookie) | JWT (самодостаточный токен) |
|---|---|---|
| Отзыв | мгновенный (удалить сессию) | сложно до истечения (нужен denylist или короткий срок) |
| Масштабирование | нужно общее хранилище сессий | проверка подписи без хранилища |
| Размер | маленький ID | токен с данными |
| Типичное применение | веб-приложения | API между сервисами, короткие access-токены |

Самое важное — не формат, а **хранение**: `Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax; Path=/`.

- `HttpOnly` — недоступна из JS (XSS не украдёт).
- `Secure` — только HTTPS.
- `SameSite=Lax` — не отправляется в межсайтовых подзапросах и POST, защищает от большинства CSRF. `Strict` — строже, `None` — только с `Secure` и для встраивания.
- Префикс `__Host-` — без `Domain`, с `Path=/` и `Secure`: нельзя подменить с поддомена.

### Почему не localStorage

Любой JS на странице (XSS, скомпрометированная зависимость, сторонний виджет) прочитает токен и унесёт его — он будет работать с любого устройства до истечения. С `HttpOnly` cookie злоумышленник при XSS может делать запросы, только пока страница открыта. Если access-токен нужен в JS — держать в памяти, коротко живущим, refresh — в `HttpOnly` cookie.

### OAuth 2.0 / OpenID Connect с PKCE

```text
1. Клиент генерирует code_verifier (случайная строка) и code_challenge = BASE64URL(SHA256(verifier)), state и nonce
2. Редирект на провайдера: /authorize?response_type=code&client_id&redirect_uri&scope=openid profile&code_challenge&code_challenge_method=S256&state
3. Пользователь входит у провайдера
4. Редирект обратно: /callback?code=…&state=… (проверить state — защита от CSRF при входе)
5. Обмен code + code_verifier на токены (id_token — кто, access_token — доступ к API, refresh_token)
6. Проверка id_token (подпись, iss, aud, exp, nonce)
```

PKCE защищает от перехвата кода: без `code_verifier` код бесполезен. Implicit flow (токены в URL) устарел и не используется.

### Паттерн BFF (Backend for Frontend)

Для SPA рекомендуемый вариант: обмен кода и хранение токенов — на **своём сервере** (BFF), браузер получает только `HttpOnly` cookie сессии; BFF проксирует запросы к API, подставляя access-токен. Токены не попадают в JS вообще. В Next.js/Nuxt роль BFF играет серверная часть фреймворка (Auth.js, Better Auth, nuxt-auth-utils).

### CSRF

Атака: сайт злоумышленника отправляет запрос к вашему API, браузер прикладывает cookie. Защита:
- `SameSite=Lax/Strict` на cookie сессии;
- изменяющие запросы — не GET;
- CSRF-токен (synchronizer или double submit) или проверка заголовков `Origin`/`Sec-Fetch-Site` на сервере;
- для JSON API — требование `Content-Type: application/json` (вызывает CORS preflight).

### Обновление токена без гонок

```ts
let refreshing: Promise<void> | null = null;

async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, { ...init, credentials: 'include' });
  if (response.status !== 401) return response;
  // Все параллельные запросы ждут ОДНО обновление, а не запускают по своему
  refreshing ??= refreshSession().finally(() => {
    refreshing = null;
  });
  await refreshing; // не удалось — refreshSession бросит, пользователь уйдёт на вход
  return fetch(input, { ...init, credentials: 'include' });
}
```

Ротация refresh-токенов (каждый используется один раз; повторное использование — признак кражи, отзыв всей цепочки). Синхронизация между вкладками: `BroadcastChannel` («вышел», «обновил сессию»), Web Locks API, чтобы обновлением занималась одна вкладка.

### Защита маршрутов

- SPA: guard в роутере (редирект на вход с `returnTo`), но данные защищает только API.
- Next.js: оптимистичная проверка cookie в `proxy.ts` (раньше middleware) для редиректов **и** проверка сессии в слое доступа к данным (Data Access Layer) рядом с каждым запросом данных, Server Action и Route Handler — сами по себе публичные эндпоинты.
- Не отдавать на клиент лишние данные пользователя: DTO с нужными полями.

### Passkeys и MFA

Passkeys (WebAuthn) — вход по ключу, привязанному к устройству и домену, с биометрией или PIN: устойчивы к фишингу и утечкам паролей. Условный UI (`autocomplete="username webauthn"`) — предложение passkey прямо в поле логина. Для паролей: MFA (TOTP, push), rate limiting, проверка по базам утечек, `autocomplete="new-password"`.

### Выход

Удалить cookie сессии (сервер), отозвать refresh-токен, очистить кэш данных на клиенте (TanStack Query, сторы), уведомить другие вкладки, при SSO — выход у провайдера (RP-initiated logout).

## Вопросы с собеседований

<details><summary>Как бы вы спроектировали систему аутентификации?</summary>

OIDC-провайдер или проверенная библиотека, Authorization Code + PKCE, BFF с `HttpOnly; Secure; SameSite` cookie, короткие access-токены и ротация refresh, CSRF-защита, обновление без гонок и синхронизация вкладок, passkeys/MFA, rate limiting, выход везде, авторизация на сервере для каждого запроса.
</details>

<details><summary>Почему localStorage — не место для токенов?</summary>

Доступен любому JS на странице: XSS или скомпрометированная зависимость унесёт долгоживущий токен. `HttpOnly` cookie недоступна JS. Если токен нужен в JS — короткоживущий в памяти, refresh — в cookie, или BFF.
</details>

<details><summary>Как спроектировать поток аутентификации для Next.js с JWT?</summary>

Вход через Server Action/Route Handler, сессия в зашифрованном и подписанном JWT в `HttpOnly` cookie (короткий срок, ротация) или ID сессии в БД; оптимистичный редирект в `proxy.ts`, а настоящая проверка — в DAL при каждом доступе к данным; клиентские компоненты получают только DTO; выход — удаление cookie и отзыв. Готовые решения: Auth.js, Better Auth.
</details>

<details><summary>Зачем нужен PKCE?</summary>

Публичный клиент (SPA, мобильное приложение) не может хранить секрет. PKCE связывает запрос авторизации и обмен кода: перехваченный код без `code_verifier` обменять нельзя. Сейчас PKCE рекомендован для всех клиентов.
</details>

<details><summary>Что такое CSRF и почему SameSite не всегда достаточно?</summary>

Подделка межсайтового запроса с cookie жертвы. `SameSite=Lax` закрывает большинство сценариев, но не запросы с того же «сайта» (поддомены, в том числе скомпрометированные), GET с побочными эффектами и старые браузеры — поэтому добавляют проверку `Origin`/`Sec-Fetch-Site` или CSRF-токен.
</details>

## Практика

1. Реализуйте `apiFetch` с одним обновлением сессии для параллельных 401 (задача в тесте темы).
2. Нарисуйте последовательность OIDC + PKCE + BFF для своего продукта.
3. Сгенерируйте `code_verifier` и `code_challenge` через Web Crypto.

Тест темы: [Аутентификация и авторизация](../quizzes/quiz.html?id=16-forms-i18n-auth/03-auth).

## Источники
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP: CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [IETF: OAuth 2.0 for Browser-Based Applications](https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/)
- [RFC 7636: PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- [Next.js: Authentication](https://nextjs.org/docs/app/guides/authentication)
- [web.dev: Passkeys](https://web.dev/articles/passkey-registration)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
