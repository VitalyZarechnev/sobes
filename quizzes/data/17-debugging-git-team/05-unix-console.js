QUIZ.register({
  "id": "17-debugging-git-team/05-unix-console",
  "section": "17-debugging-git-team",
  "title": "Unix-консоль для фронтендера",
  "order": 5,
  "source": "../17-debugging-git-team/05-unix-console.md",
  "questions": [
    {
      "type": "single",
      "level": "middle",
      "q": "Что делает эта команда?",
      "code": "awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10",
      "lang": "bash",
      "options": [
        "Выводит 10 последних строк лога",
        "Показывает 10 самых частых IP с числом запросов",
        "Удаляет дубликаты строк из лога",
        "Считает число уникальных IP"
      ],
      "answer": 1,
      "explain": "`awk` берёт первое поле (IP), `sort` группирует одинаковые, `uniq -c` считает, `sort -rn` сортирует по убыванию числа, `head` берёт 10."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Зачем `sort` перед `uniq -c`?",
      "options": [
        "Для скорости",
        "`uniq` схлопывает только соседние одинаковые строки",
        "Без него `uniq` не запустится",
        "Чтобы убрать пустые строки"
      ],
      "answer": 1,
      "explain": "Без сортировки одинаковые IP, разбросанные по файлу, посчитаются отдельными группами."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Куда попадёт stderr?",
      "code": "npm run build 2>&1 > out.log",
      "lang": "bash",
      "options": [
        "В `out.log`",
        "На экран (в терминал)",
        "В `/dev/null`",
        "Никуда, команда упадёт"
      ],
      "answer": 1,
      "explain": "Перенаправления применяются слева направо: `2>&1` направляет stderr туда, куда *сейчас* смотрит stdout — в терминал. Потом stdout переводится в файл. Правильно: `> out.log 2>&1`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Шаг CI выполняет `npm test | tee test.log`. Тесты упали. Какой будет статус шага без дополнительных настроек?",
      "options": [
        "Красный: npm вернул ненулевой код",
        "Зелёный: код конвейера — код последней команды, а `tee` завершился успешно",
        "Шаг зависнет",
        "Зависит от версии npm"
      ],
      "answer": 1,
      "explain": "Нужен `set -o pipefail` — тогда конвейер вернёт ошибку любой упавшей команды."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Как узнать, какой процесс занял порт 3000?",
      "options": [
        "`ps 3000`",
        "`lsof -i :3000`",
        "`kill -9 3000`",
        "`netstat --kill 3000`"
      ],
      "answer": 1,
      "explain": "`lsof -i :PORT` показывает PID и имя процесса. Альтернатива на Linux — `ss -ltnp`."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Чем `kill -9` отличается от `kill`?",
      "options": [
        "Ничем",
        "`kill` шлёт `SIGTERM`, который можно перехватить и завершиться корректно; `-9` — `SIGKILL`, который перехватить нельзя",
        "`-9` убивает 9 процессов",
        "`kill` только приостанавливает процесс"
      ],
      "answer": 1,
      "explain": "`SIGKILL` — последнее средство: процесс не закроет соединения и не допишет данные."
    },
    {
      "type": "multi",
      "level": "senior",
      "q": "Какие команды помогут проверить кэширование и сжатие статики на CDN?",
      "options": [
        "`curl -I https://site/assets/app.3f9a.js`",
        "`curl -I -H 'Accept-Encoding: br, gzip' URL`",
        "`dig site CNAME`",
        "`chmod 644 app.js`",
        "`curl -sv URL -o /dev/null`"
      ],
      "answer": [
        0,
        1,
        4
      ],
      "explain": "`-I` — заголовки (`Cache-Control`, `Age`, `x-cache`), `Accept-Encoding` — проверка `Content-Encoding`, `-v` — полный обмен. `dig` полезен для DNS, но кэш не покажет."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Что означают права `rw-r--r--` в восьмеричной записи?",
      "options": [
        "`755`",
        "`644`",
        "`600`",
        "`744`"
      ],
      "answer": 1,
      "explain": "rw- = 4+2 = 6, r-- = 4, r-- = 4."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Почему SSH отказывается использовать приватный ключ с правами `644`?",
      "options": [
        "Ключ повреждён",
        "Ключ доступен на чтение другим пользователям — небезопасно; нужно `600`",
        "Нужно `755`, чтобы ключ был исполняемым",
        "SSH не читает файлы из `~/.ssh`"
      ],
      "answer": 1,
      "explain": "Приватный ключ должен быть доступен только владельцу."
    },
    {
      "type": "single",
      "level": "middle",
      "q": "Почему в `package.json` работает `\"test\": \"vitest\"`, а в терминале `vitest` — «command not found»?",
      "options": [
        "Vitest установлен глобально только для npm",
        "`npm run` добавляет `node_modules/.bin` в `PATH` на время выполнения скрипта",
        "В терминале нужно писать `vitest.js`",
        "Скрипты npm выполняются в Docker"
      ],
      "answer": 1,
      "explain": "В терминале используйте `npx vitest` или `npm test`."
    },
    {
      "type": "single",
      "level": "senior",
      "q": "Как безопасно удалить все найденные файлы, если в именах есть пробелы?",
      "options": [
        "`find . -name '*.orig' | xargs rm`",
        "`find . -name '*.orig' -print0 | xargs -0 rm`",
        "`rm $(find . -name '*.orig')`",
        "`ls *.orig | rm`"
      ],
      "answer": 1,
      "explain": "`-print0`/`-0` разделяют имена нулевым байтом. Варианты 1 и 3 разобьют имя с пробелом на два аргумента. Ещё проще — `find ... -delete`."
    },
    {
      "type": "order",
      "level": "middle",
      "q": "Расставьте по порядку конвейер «сколько раз встречается каждая ошибка, самые частые сверху»:",
      "items": [
        "`grep ERROR app.log`",
        "`awk -F': ' '{print $2}'`",
        "`sort`",
        "`uniq -c`",
        "`sort -rn`"
      ],
      "explain": "Отфильтровать → выделить текст ошибки → сгруппировать → посчитать → отсортировать по убыванию."
    },
    {
      "type": "open",
      "level": "senior",
      "q": "Сервер перестал отвечать, вы зашли по SSH. Какие команды выполните первыми и что ищете?",
      "answer": "`df -h` — не кончилось ли место (частая причина: логи, Docker-образы). `free -h` / `top` / `htop` — память и CPU, нет ли процесса, съевшего всё. `ps aux --sort=-%mem | head` — кто потребляет. `journalctl -u <сервис> -n 100` или `docker logs --tail 100 <контейнер>` — последние ошибки. `ss -ltnp` / `lsof -i :PORT` — слушает ли приложение порт. `curl -I localhost:PORT` — отвечает ли изнутри (тогда проблема в сети или прокси). `dmesg | tail` — не убил ли процесс OOM killer."
    }
  ],
  "tasks": [
    {
      "title": "Права: из `rwx` в восьмеричную запись",
      "level": "middle",
      "prompt": "Реализуйте `toOctal(perms)`: на вход строка из 9 символов вида `rwxr-xr--` (буквы `r`, `w`, `x` на своих местах или `-`). Верните строку из трёх цифр, например `'754'`. Для некорректной строки (не 9 символов, буква не на своём месте, лишние символы) бросайте `Error`.",
      "starter": "function toOctal(perms) {\n  // ваш код\n}",
      "solution": "function toOctal(perms) {\n  if (typeof perms !== 'string' || !/^([r-][w-][x-]){3}$/.test(perms)) throw new Error('invalid permissions: ' + perms);\n  let out = '';\n  for (let i = 0; i < 9; i += 3) {\n    const [r, w, x] = perms.slice(i, i + 3);\n    out += (r === 'r' ? 4 : 0) + (w === 'w' ? 2 : 0) + (x === 'x' ? 1 : 0);\n  }\n  return out;\n}",
      "tests": [
        {
          "name": "755",
          "code": "return toOctal('rwxr-xr-x') === '755';"
        },
        {
          "name": "644 и 600",
          "code": "return toOctal('rw-r--r--') === '644' && toOctal('rw-------') === '600';"
        },
        {
          "name": "все нули",
          "code": "return toOctal('---------') === '000';"
        },
        {
          "name": "ошибка на мусоре",
          "code": "const bad = ['rwx', 'xwrr-xr-x', 'rwxr-xr-xa', 'rwxrwxrwZ'];\nreturn bad.every((p) => { try { toOctal(p); return false; } catch { return true; } });"
        }
      ]
    },
    {
      "title": "Конвейер `sort | uniq -c | sort -rn | head`",
      "level": "middle",
      "prompt": "Реализуйте `topCounts(lines, n)` — аналог `sort | uniq -c | sort -rn | head -n`. На вход массив строк. Верните массив пар `[count, value]`, отсортированный по убыванию `count`, при равенстве — по возрастанию `value` (обычное строковое сравнение). Пустые строки игнорируйте. Не больше `n` элементов.",
      "starter": "function topCounts(lines, n) {\n  // ваш код\n}",
      "solution": "function topCounts(lines, n) {\n  const counts = new Map();\n  for (const line of lines) {\n    if (line === '') continue;\n    counts.set(line, (counts.get(line) ?? 0) + 1);\n  }\n  return [...counts]\n    .map(([value, count]) => [count, value])\n    .sort((a, b) => b[0] - a[0] || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))\n    .slice(0, n);\n}",
      "tests": [
        {
          "name": "считает и сортирует",
          "code": "const r = topCounts(['1.1.1.1', '2.2.2.2', '1.1.1.1', '3.3.3.3', '1.1.1.1', '2.2.2.2'], 2);\nreturn JSON.stringify(r) === JSON.stringify([[3, '1.1.1.1'], [2, '2.2.2.2']]);"
        },
        {
          "name": "равные — по значению",
          "code": "const r = topCounts(['b', 'a', 'c', 'a', 'b', 'c'], 3);\nreturn JSON.stringify(r) === JSON.stringify([[2, 'a'], [2, 'b'], [2, 'c']]);"
        },
        {
          "name": "пустые строки и n больше длины",
          "code": "const r = topCounts(['x', '', 'x', ''], 10);\nreturn JSON.stringify(r) === JSON.stringify([[2, 'x']]);"
        },
        {
          "name": "пустой вход",
          "code": "return Array.isArray(topCounts([], 5)) && topCounts([], 5).length === 0;"
        }
      ]
    },
    {
      "title": "Разбор `.env`-файла",
      "level": "senior",
      "prompt": "Реализуйте `parseEnv(text)` — упрощённый разбор `.env`. Правила:\n- строки разделены `\\n` (учитывайте и `\\r\\n`);\n- пустые строки и строки, начинающиеся с `#` (после пробелов), пропускаются;\n- допустим префикс `export `;\n- `KEY=value`: пробелы вокруг ключа и неквотированного значения обрезаются; у неквотированного значения ` #` и всё после — комментарий;\n- значение в двойных кавычках: кавычки снимаются, `\\n` внутри превращается в перевод строки, `#` комментарием не считается;\n- значение в одинарных кавычках: кавычки снимаются, содержимое берётся как есть;\n- строки без `=` пропускаются; при повторе ключа побеждает последнее значение.\nВерните объект.",
      "starter": "function parseEnv(text) {\n  // ваш код\n}",
      "solution": "function parseEnv(text) {\n  const out = {};\n  for (const raw of text.split(/\\r?\\n/)) {\n    let line = raw.trim();\n    if (!line || line.startsWith('#')) continue;\n    if (line.startsWith('export ')) line = line.slice(7).trim();\n    const eq = line.indexOf('=');\n    if (eq === -1) continue;\n    const key = line.slice(0, eq).trim();\n    if (!key) continue;\n    let value = line.slice(eq + 1).trim();\n    if (value.length >= 2 && value[0] === '\"' && value.endsWith('\"')) {\n      value = value.slice(1, -1).replace(/\\\\n/g, '\\n');\n    } else if (value.length >= 2 && value[0] === \"'\" && value.endsWith(\"'\")) {\n      value = value.slice(1, -1);\n    } else {\n      const hash = value.indexOf(' #');\n      if (hash !== -1) value = value.slice(0, hash).trim();\n    }\n    out[key] = value;\n  }\n  return out;\n}",
      "tests": [
        {
          "name": "простые пары и комментарии",
          "code": "const r = parseEnv('# config\\nPORT=3000\\n\\nHOST = localhost  \\n');\nreturn r.PORT === '3000' && r.HOST === 'localhost' && Object.keys(r).length === 2;"
        },
        {
          "name": "export и комментарий в конце строки",
          "code": "const r = parseEnv('export NODE_ENV=production # prod\\nURL=http://x.dev/#anchor');\nreturn r.NODE_ENV === 'production' && r.URL === 'http://x.dev/#anchor';"
        },
        {
          "name": "двойные кавычки",
          "code": "const r = parseEnv('MSG=\"hello # not comment\\\\nworld\"');\nreturn r.MSG === 'hello # not comment\\nworld';"
        },
        {
          "name": "одинарные кавычки как есть",
          "code": "const r = parseEnv(\"RAW='a\\\\nb # c'\");\nreturn r.RAW === 'a\\\\nb # c';"
        },
        {
          "name": "CRLF, без = и повтор ключа",
          "code": "const r = parseEnv('A=1\\r\\nGARBAGE\\r\\nA=2\\r\\n');\nreturn r.A === '2' && !('GARBAGE' in r);"
        }
      ]
    }
  ]
});
