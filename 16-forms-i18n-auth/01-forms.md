# Формы и валидация

> ⏱ ~4 ч · 🎯 Строить сложные формы: схема как источник истины, правильная модель состояния, асинхронная и серверная валидация, динамические поля, доступность и UX ошибок.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Понимаю controlled и uncontrolled поля и почему react-hook-form на uncontrolled
- [ ] Использую схему (zod/valibot) для типов и правил, общих с сервером
- [ ] Делаю асинхронную валидацию с debounce и отменой
- [ ] Маплю ошибки сервера на поля, фокусирую первое ошибочное
- [ ] Знаю React 19 Actions (`useActionState`, `<form action>`) и progressive enhancement
- [ ] Делаю форму доступной
- [ ] Ответил вслух на вопросы ниже

## Теория

### Нативная основа

Начинайте с HTML: `<form>`, `<label for>`, правильные `type` (`email`, `tel`, `number`, `date`), `inputmode` (мобильная клавиатура), `autocomplete` (`email`, `new-password`, `one-time-code`, `street-address` — автозаполнение и менеджеры паролей), `required`, `minlength`, `pattern`, `<button type="submit">` (Enter отправляет форму). Constraint Validation API (`checkValidity`, `setCustomValidity`, `:user-invalid`) — бесплатная базовая валидация.

### Модель состояния

| Подход | Плюсы | Минусы |
|---|---|---|
| Controlled (`value` + `onChange`) | значение всегда в стейте: форматирование на лету, зависимые поля | рендер на каждое нажатие во всей форме, если состояние наверху |
| Uncontrolled (`defaultValue`, `ref`, `FormData`) | минимум рендеров, работа с нативной формой и Actions | сложнее реагировать на каждое изменение |
| Библиотека (react-hook-form, TanStack Form, VeeValidate, FormKit) | состояние полей (`dirty`, `touched`), массивы, валидация, подписки на отдельные поля | зависимость и её API |

Для больших форм нужно, чтобы ввод в одно поле не перерендеривал всю форму: react-hook-form хранит значения вне React-состояния и подписывает только нужные компоненты; TanStack Form — селекторы на поля.

### Схема — источник истины

```ts
import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z.email('Введите корректный email'),
    password: z.string().min(12, 'Минимум 12 символов'),
    confirm: z.string(),
    accountType: z.enum(['person', 'company']),
    inn: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Пароли не совпадают' })
  .refine((d) => d.accountType !== 'company' || /^\d{10}$/.test(d.inn ?? ''), {
    path: ['inn'],
    message: 'ИНН юрлица — 10 цифр',
  });

export type SignupInput = z.infer<typeof signupSchema>; // типы из схемы
```

Одна схема на клиенте (UX) и сервере (безопасность — клиентской валидации нельзя доверять). Условные поля — через `refine` или discriminated union (`z.discriminatedUnion('accountType', [...])`).

### Асинхронная валидация

Проверка «логин занят»: debounce 300–500 мс, отмена предыдущего запроса (`AbortController`) или игнорирование устаревших ответов, индикатор проверки, кэш результатов. Финальная проверка — всё равно на сервере при отправке (гонка: логин могли занять между проверкой и отправкой).

### Ошибки сервера

```ts
try {
  await api.signup(values);
} catch (error) {
  if (error instanceof ApiError && error.status === 422 && error.details) {
    for (const [field, messages] of Object.entries(error.details)) {
      form.setError(field as keyof SignupInput, { message: messages[0] });
    }
    form.setFocus(Object.keys(error.details)[0] as keyof SignupInput);
  } else {
    setFormError('Не удалось отправить. Попробуйте ещё раз.'); // общая ошибка над формой
  }
}
```

### React 19 Actions

```tsx
async function subscribe(prevState: State, formData: FormData): Promise<State> {
  'use server'; // в Next.js — серверная функция; без фреймворка — обычная async-функция
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  await db.subscribe(parsed.data);
  return { ok: true };
}

function SubscribeForm() {
  const [state, formAction, isPending] = useActionState(subscribe, { errors: {} });
  return (
    <form action={formAction}>
      <input name="email" type="email" aria-invalid={Boolean(state.errors?.email)} />
      <button disabled={isPending}>Подписаться</button>
    </form>
  );
}
```

С серверными функциями форма работает **до гидратации** (progressive enhancement). `useFormStatus` — состояние отправки в дочерних компонентах, `useOptimistic` — оптимистичный UI.

### Динамические поля

Массивы полей (`useFieldArray`): стабильные ключи (id, не индекс), добавление/удаление/перестановка, валидация элементов. Формы из конфигурации (JSON Schema → UI) — для конструкторов и админок: схема описывает поля, типы, условия видимости; рендерер сопоставляет типы с компонентами.

### UX и доступность

- `<label>` у каждого поля (placeholder — не замена).
- Ошибки показывать после blur или попытки отправки, а не при первом символе; после исправления — убирать сразу.
- Ошибка связана с полем: `aria-invalid="true"` + `aria-describedby="email-error"`; сводка ошибок с `role="alert"` при отправке; фокус на первое ошибочное поле.
- Группы — `<fieldset>` + `<legend>` (радиокнопки, адрес).
- Не блокировать кнопку отправки без объяснения — лучше показать, что не так.
- Защита от двойной отправки, сохранение черновика длинных форм, предупреждение о несохранённых изменениях.
- Не мешать вставке в поля паролей и кодов, поддерживать менеджеры паролей.

## Вопросы с собеседований

<details><summary>Как реализовать надёжную систему форм со сложной валидацией и динамическими полями?</summary>

Схема как источник истины (типы + правила, общие с сервером), библиотека форм для состояния полей и массивов, условная валидация через union/refine, асинхронные проверки с debounce и отменой, маппинг серверных ошибок на поля, доступность и UX ошибок, тесты на ключевые сценарии.
</details>

<details><summary>Controlled или uncontrolled для большой формы?</summary>

Uncontrolled-ядро (react-hook-form) или подписки на отдельные поля (TanStack Form): ввод не перерендеривает всю форму. Controlled — точечно, где нужно форматирование на лету или зависимые поля. Нативные формы и Actions естественно работают с uncontrolled и `FormData`.
</details>

<details><summary>Почему клиентской валидации недостаточно?</summary>

Клиент полностью под контролем пользователя: запрос можно отправить в обход формы. Клиентская валидация — для UX, серверная — для корректности и безопасности. Общая схема убирает расхождения.
</details>

<details><summary>Как показать ошибки доступно?</summary>

Текст ошибки рядом с полем, связь через `aria-describedby`, `aria-invalid`, сводка с `role="alert"` при отправке, фокус на первое ошибочное поле, не только цветом, понятные формулировки «что сделать».
</details>

## Практика

1. Форма регистрации: zod-схема, асинхронная проверка email, серверные ошибки на полях.
2. Форма с массивом адресов: добавление, удаление, перестановка, валидация каждого.
3. Форма подписки на `useActionState`, работающая с отключённым JS.

Тест темы: [Формы и валидация](../quizzes/quiz.html?id=16-forms-i18n-auth/01-forms).

## Источники
- [MDN: Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation)
- [React: useActionState](https://react.dev/reference/react/useActionState)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Form](https://tanstack.com/form/latest)
- [Zod](https://zod.dev/)
- [VeeValidate](https://vee-validate.logaretm.com/v4/)
- [WAI: Forms tutorial](https://www.w3.org/WAI/tutorials/forms/)
