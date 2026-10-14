# Пишем плагины и лоадеры

> ⏱ ~3 ч · 🎯 Написать плагин Vite/Rollup и лоадер webpack, понимать жизненный цикл хуков и когда плагин — правильное решение.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Знаю основные хуки Rollup/Vite: `resolveId`, `load`, `transform`, `generateBundle`
- [ ] Написал виртуальный модуль
- [ ] Написал transform-плагин с фильтром по файлам и sourcemap
- [ ] Понимаю, чем лоадер webpack отличается от плагина
- [ ] Ответил вслух на вопросы ниже

## Теория

### Когда нужен свой плагин

- Сгенерировать модуль во время сборки: список маршрутов из файловой структуры, версия и дата сборки, манифест иконок.
- Преобразовать нестандартные файлы: `.md` → компонент, `.svg` → компонент, YAML/CSV → JSON.
- Вставить что-то в HTML: CSP-nonce, preload-подсказки, скрипт темы.
- Проверки на этапе сборки: запрет импорта серверного кода в клиент, лимит размера чанков.

Прежде чем писать — поищите готовый: экосистема Rollup/Vite и webpack огромна.

### Хуки Rollup/Vite (совместимы с Rolldown)

| Хук | Когда | Для чего |
|---|---|---|
| `config`, `configResolved` | старт (только Vite) | изменить или прочитать конфиг |
| `configureServer` | dev (только Vite) | свои middleware dev-сервера |
| `resolveId(source, importer)` | на каждый импорт | вернуть свой id (виртуальные модули, алиасы) |
| `load(id)` | загрузка модуля | вернуть код для id (виртуальный модуль, чтение нестандартного файла) |
| `transform(code, id)` | после загрузки | изменить код модуля, вернуть `{ code, map }` |
| `transformIndexHtml` | HTML (только Vite) | вставить теги и атрибуты |
| `handleHotUpdate`/`hotUpdate` | dev, изменение файла | своя логика HMR |
| `generateBundle`, `writeBundle` | конец сборки | добавить/проверить файлы вывода |

Порядок плагинов: `enforce: 'pre' | 'post'`, `apply: 'serve' | 'build'` — когда применять.

### Виртуальный модуль

```ts
import type { Plugin } from 'vite';

// import { version, builtAt } from 'virtual:build-info'
export function buildInfo(): Plugin {
  const publicId = 'virtual:build-info';
  const resolvedId = '\0' + publicId; // \0 — соглашение: другие плагины не трогают такой id
  return {
    name: 'build-info',
    resolveId(id) {
      return id === publicId ? resolvedId : null;
    },
    load(id) {
      if (id !== resolvedId) return null;
      return `export const version = ${JSON.stringify(process.env.npm_package_version)};
export const builtAt = ${JSON.stringify(new Date().toISOString())};`;
    },
  };
}
```

Для TypeScript — декларация: `declare module 'virtual:build-info' { export const version: string; export const builtAt: string; }`.

### Transform-плагин

```ts
import type { Plugin } from 'vite';
import MagicString from 'magic-string';

// Удаляет вызовы console.debug(...) из продакшен-сборки (упрощённо, без AST)
export function stripDebug(): Plugin {
  return {
    name: 'strip-debug',
    apply: 'build',
    transform(code, id) {
      if (!/\.[jt]sx?$/.test(id) || id.includes('node_modules')) return null;
      if (!code.includes('console.debug')) return null; // быстрый выход: transform вызывается для каждого файла
      const s = new MagicString(code);
      for (const match of code.matchAll(/console\.debug\([^)]*\);?/g)) {
        s.remove(match.index, match.index + match[0].length);
      }
      return { code: s.toString(), map: s.generateMap({ hires: true }) }; // sourcemap не ломается
    },
  };
}
```

🪤 **Ловушка:** регулярные выражения по коду ломаются на вложенных скобках, строках и комментариях. Для серьёзных трансформаций — парсер (`this.parse` в Rollup, Oxc, Babel) и обход AST.

🪤 **Ловушка:** не возвращать sourcemap из `transform` — стектрейсы и отладка поедут на всех последующих этапах.

### Лоадер webpack

Лоадер — функция «исходник → исходник» для одного типа файлов, цепочка выполняется справа налево. Плагин webpack — класс с методом `apply(compiler)`, подписывается на хуки компилятора (tapable) и может делать что угодно: добавлять ассеты, менять чанки, собирать статистику.

```js
// yaml-loader.js: import config from './config.yaml'
const YAML = require('yaml');

module.exports = function yamlLoader(source) {
  this.cacheable?.(); // результат зависит только от содержимого файла
  const data = YAML.parse(source);
  return `export default ${JSON.stringify(data)};`;
};
```

```js
// webpack.config.js
module.exports = {
  module: { rules: [{ test: /\.ya?ml$/, use: './yaml-loader.js' }] },
};
```

Rspack поддерживает большинство лоадеров и многие плагины webpack, а также свои встроенные на Rust (например, `builtin:swc-loader`).

### Производительность плагинов

- Фильтровать по id как можно раньше (в Rolldown/Vite 8 — декларативный `filter` у хука, чтобы вообще не вызывать JS для лишних файлов).
- Кэшировать дорогие вычисления, не читать весь проект в каждом `transform`.
- В Rolldown каждый вызов JS-плагина — переход Rust ↔ JS, поэтому лишние вызовы особенно дороги.

## Вопросы с собеседований

<details><summary>Чем лоадер webpack отличается от плагина?</summary>

Лоадер трансформирует отдельный файл определённого типа (вход — исходник, выход — JS-модуль). Плагин работает на уровне всей компиляции через хуки: генерирует файлы, меняет разбиение на чанки, внедряет переменные, собирает метрики.
</details>

<details><summary>Что такое виртуальный модуль и зачем `\0` в id?</summary>

Модуль, которого нет на диске: плагин сам резолвит id и отдаёт код в `load`. Префикс `\0` — соглашение Rollup: такие id не обрабатываются другими плагинами (например, резолвером node или трансформерами файлов).
</details>

<details><summary>Какой плагин сборки вы писали или написали бы?</summary>

Пример ответа: генерация типизированного списка маршрутов из папки `pages`, инлайн критического CSS, генерация `version.json` для проверки новой версии приложения, плагин, падающий при импорте `server-only` модулей в клиентский бандл. Важно рассказать про фильтрацию файлов, sourcemaps, кэш и тесты плагина.
</details>

<details><summary>Почему плагины Vite совместимы с Rollup и что изменилось с Rolldown?</summary>

Vite изначально использовал Rollup для prod-сборки и расширил его интерфейс плагинов. Rolldown реализует тот же API на Rust, поэтому большинство плагинов работают без изменений; добавлены фильтры хуков для производительности и некоторые встроенные возможности (transform TS/JSX, минификация) вместо внешних плагинов.
</details>

## Практика

1. Напишите `virtual:routes`: модуль экспортирует массив путей из файлов `src/pages/**/*.tsx`.
2. Напишите плагин, который в `generateBundle` падает, если какой-то чанк больше 250 KB.
3. Напишите лоадер webpack для `.txt`, экспортирующий строку.

Тест темы: [Плагины и лоадеры](../quizzes/quiz.html?id=10-tooling-testing/02-plugins-and-loaders).

## Источники
- [Vite: Plugin API](https://vite.dev/guide/api-plugin.html)
- [Rollup: Plugin Development](https://rollupjs.org/plugin-development/)
- [webpack: Writing a Loader](https://webpack.js.org/contribute/writing-a-loader/)
- [webpack: Writing a Plugin](https://webpack.js.org/contribute/writing-a-plugin/)
- [magic-string](https://github.com/Rich-Harris/magic-string)
