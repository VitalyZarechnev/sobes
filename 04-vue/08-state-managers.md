# Стейт-менеджеры во Vue

> ⏱ ~3 ч · 🎯 Выбирать, где жить состоянию во Vue/Nuxt: локально, composable, provide/inject, Pinia, серверный кэш (Pinia Colada, TanStack Query), URL — и не ломать реактивность и SSR.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md) · Общая теория и сравнение моделей — в [React: стейт-менеджеры](../03-react/10-state-managers-compared.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Разделяю состояние по типам: серверное, клиентское, UI, URL, форма
- [ ] Знаю, когда хватит composable с модульным состоянием и чем это опасно при SSR
- [ ] Пишу Pinia-сторы в options и setup-стиле, использую `storeToRefs`
- [ ] Использую Pinia Colada или TanStack Vue Query для серверных данных
- [ ] Понимаю SSR-гидратацию сторов в Nuxt и «загрязнение состояния между запросами»
- [ ] Ответил вслух на вопросы ниже

## Теория

### Почему во Vue стор нужен реже, чем в React

Реактивность Vue — встроенный «стейт-менеджер»: `ref`/`reactive`, вынесенные в модуль, уже глобальное реактивное состояние с точечными обновлениями (без селекторов и мемоизации). Поэтому вопрос не «какой Redux», а **где владелец состояния и сколько у него жизни**.

| Тип | Где хранить во Vue |
|---|---|
| UI (открыт ли дропдаун) | `ref` в компоненте |
| Общее для поддерева (форма-визард, compound-компонент) | `provide`/`inject` с типизированным ключом |
| Глобальное клиентское (сессия, корзина, настройки) | Pinia |
| Серверное (списки, сущности) | Pinia Colada, TanStack Vue Query, `useFetch`/`useAsyncData` в Nuxt |
| URL (фильтры, пагинация) | `route.query` через Vue Router (композаблы вроде `useRouteQuery` из VueUse) |
| Форма | VeeValidate, FormKit, локальный `reactive` |
| Сложный процесс | конечный автомат (XState + `@xstate/vue`) |

### Composable с модульным состоянием

```ts
// useCounter.ts: состояние вне функции → общее для всех потребителей
const count = ref(0);

export function useCounter() {
  const double = computed(() => count.value * 2);
  const increment = () => count.value++;
  return { count: readonly(count), double, increment };
}
```

Просто и достаточно для небольших SPA. Минусы: нет devtools и плагинов, нет SSR-изоляции.

🪤 **Ловушка (SSR):** модульное состояние на сервере живёт в одном процессе Node и **общее для всех запросов** — данные одного пользователя утекут другому (cross-request state pollution). В Nuxt — `useState('key', () => init)` или Pinia, которые создаются на каждый запрос и передаются клиенту в payload. VueUse `createGlobalState` и `createSharedComposable` удобны в SPA, но с той же оговоркой для SSR.

### provide / inject

```ts
// Типизированный ключ — потребители получают правильный тип
export const WizardKey: InjectionKey<{ step: Ref<number>; next: () => void }> = Symbol('wizard');

// Родитель
provide(WizardKey, { step, next });
// Потомок на любой глубине
const wizard = inject(WizardKey); // возможен undefined — проверяйте или задавайте дефолт
```

Для состояния, принадлежащего поддереву (несколько независимых визардов на странице), а не всему приложению.

### Pinia

Официальный стор Vue (Vuex в режиме поддержки, для новых проектов не используется). Pinia 3 поддерживает только Vue 3.

```ts
// Setup-стиль: как composable, но с devtools, плагинами и SSR-изоляцией
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const total = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0)); // getter
  function add(item: CartItem) { // action
    const existing = items.value.find((i) => i.id === item.id);
    if (existing) existing.qty++;
    else items.value.push({ ...item, qty: 1 });
  }
  return { items, total, add }; // всё состояние нужно вернуть, иначе не будет в devtools и SSR
});
```

```ts
// В компоненте
const cart = useCartStore();
const { items, total } = storeToRefs(cart); // ❗ деструктуризация без storeToRefs теряет реактивность
const { add } = cart; // действия можно деструктурировать напрямую
```

- Options-стиль (`state`, `getters`, `actions`) — проще для новичков, `$reset()` из коробки.
- `$patch`, `$subscribe`, `$onAction` (логирование, аналитика), плагины (персистентность — `pinia-plugin-persistedstate`).
- Сторы могут использовать друг друга внутри actions/getters (избегайте циклов на верхнем уровне setup).
- Тестирование — `createTestingPinia` из `@pinia/testing`.

### Серверное состояние

Не копируйте ответы API в Pinia руками: понадобится повторять кэш, дедупликацию, инвалидацию, фоновое обновление, гонки.

```ts
// Pinia Colada: серверный кэш поверх Pinia
const { data: todos, isPending, error } = useQuery({
  key: ['todos'],
  query: () => api.getTodos(),
});

const queryCache = useQueryCache();
const { mutate: addTodo } = useMutation({
  mutation: (text: string) => api.createTodo(text),
  onSettled: () => queryCache.invalidateQueries({ key: ['todos'] }),
});
```

TanStack Vue Query — тот же подход с богатой экосистемой (общая с React модель знаний). В Nuxt — `useFetch`/`useAsyncData` с ключом: данные, полученные на сервере, передаются в payload и не запрашиваются повторно при гидратации (см. [Nuxt](07-nuxt.md)).

### Сравнение

| | composable + ref | provide/inject | Pinia | Pinia Colada / Vue Query |
|---|---|---|---|---|
| Область | модуль (глобально) | поддерево | приложение (на запрос в SSR) | кэш по ключам |
| DevTools | нет | частично | да | да |
| SSR-безопасность | нет (без доработок) | да | да | да |
| Для чего | маленькие SPA, утилиты | компонентные системы | клиентское доменное состояние | серверные данные |

Альтернативы: effector (`effector-vue`) — событийная модель, отделённая от UI; XState — для сложных процессов.

## Вопросы с собеседований

<details><summary>Зачем Pinia, если можно вынести `ref` в модуль?</summary>

Pinia даёт DevTools (история, time travel), плагины (персистентность, логирование), изоляцию состояния на запрос при SSR и сериализацию в payload, тестовые утилиты и единые соглашения. Модульный `ref` достаточен для маленьких SPA, но опасен при SSR (общее состояние между пользователями).
</details>

<details><summary>Почему при деструктуризации стора теряется реактивность?</summary>

Стор — `reactive`-объект; деструктуризация копирует текущие значения. `storeToRefs(store)` превращает состояние и геттеры в `ref`, связанные со стором. Действия — обычные функции, их можно деструктурировать.
</details>

<details><summary>Что такое cross-request state pollution?</summary>

При SSR модуль загружается один раз на процесс, и состояние на уровне модуля общее для всех запросов: данные одного пользователя могут попасть в HTML другого. Решение — создавать состояние на запрос (Pinia, `useState` в Nuxt) и передавать клиенту через payload.
</details>

<details><summary>Где хранить данные с сервера во Vue-приложении?</summary>

В серверном кэше (Pinia Colada, TanStack Vue Query, `useFetch`/`useAsyncData` в Nuxt) с ключами, инвалидацией после мутаций и фоновым обновлением. В Pinia — клиентское состояние (сессия, корзина, UI-настройки).
</details>

<details><summary>Чем Pinia отличается от Vuex?</summary>

Нет мутаций (только state, getters, actions), полноценная типизация без обёрток, модульность «из коробки» (каждый стор независим, без вложенных модулей и namespace), setup-стиль на Composition API, меньший размер. Vuex для новых проектов не рекомендуется.
</details>

## Практика

1. Перепишите корзину из модульного `ref` на Pinia setup-стор и подключите персистентность.
2. Список задач на Pinia Colada: запрос, мутация, оптимистичное обновление и инвалидация.
3. Найдите в Nuxt-проекте модульное состояние и замените его на `useState`.

Тест темы: [Стейт-менеджеры во Vue](../quizzes/quiz.html?id=04-vue/08-state-managers).

## Источники
- [Vue: State Management](https://vuejs.org/guide/scaling-up/state-management.html)
- [Pinia](https://pinia.vuejs.org/)
- [Pinia: storeToRefs](https://pinia.vuejs.org/core-concepts/#Destructuring-from-a-Store)
- [Pinia Colada](https://pinia-colada.esm.dev/)
- [TanStack Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview)
- [Nuxt: State Management](https://nuxt.com/docs/getting-started/state-management)
- [Vue: SSR — Cross-Request State Pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)
