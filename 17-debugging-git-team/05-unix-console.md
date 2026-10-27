# Unix-консоль для фронтендера

> ⏱ ~3 ч · 🎯 Уверенно работать в терминале: найти файл и строку, разобрать лог конвейером, найти и остановить процесс на порту, проверить заголовки и DNS, зайти на сервер, понять права и переменные окружения.
> ← [Раздел](README.md) · [Роадмап](../ROADMAP.md)

## Чек-лист
- [ ] Прочитал теорию
- [ ] Понимаю stdin/stdout/stderr, конвейеры и перенаправления (`|`, `>`, `>>`, `2>&1`)
- [ ] Умею искать файлы и текст: `find`, `grep`/`rg`, `xargs`
- [ ] Могу разобрать лог конвейером `awk | sort | uniq -c | sort -rn | head`
- [ ] Знаю, как найти и остановить процесс, занявший порт, и чем `SIGTERM` отличается от `SIGKILL`
- [ ] Проверяю заголовки и TLS через `curl`, DNS через `dig`
- [ ] Понимаю права `rwx` и восьмеричную запись, переменные окружения и `PATH`
- [ ] Понимаю коды выхода и почему от них зависит CI
- [ ] Ответил вслух на вопросы ниже

## Теория

### Потоки, конвейеры, перенаправления

У каждого процесса три потока: **stdin** (0), **stdout** (1), **stderr** (2).

```bash
npm run build > build.log          # stdout в файл (перезаписать)
npm run build >> build.log         # дописать
npm run build 2> errors.log        # только stderr
npm run build > all.log 2>&1       # оба потока в один файл (порядок важен!)
npm run build 2>&1 | tee build.log # и на экран, и в файл
cat access.log | grep ' 500 ' | wc -l   # конвейер: stdout → stdin следующей команды
```

🪤 **Ловушка:** `cmd 2>&1 > file` и `cmd > file 2>&1` — разные вещи. Перенаправления применяются слева направо: в первом случае stderr уходит туда, куда *в тот момент* смотрел stdout, то есть на экран.

### Коды выхода и цепочки команд

`0` — успех, всё остальное — ошибка. Последний код — в `$?`.

```bash
npm test && npm run build   # build только если тесты прошли
npm run lint || true        # не валить скрипт, даже если линтер упал
set -euo pipefail           # в скриптах: падать на ошибке, неизвестной переменной, ошибке в конвейере
```

Именно по коду выхода CI решает, зелёный шаг или красный. Скрипт проверки, который пишет ошибки, но завершается с `0`, ничего не проверяет. В Node — `process.exitCode = 1` или `process.exit(1)`.

🪤 **Ловушка:** без `pipefail` код конвейера — это код *последней* команды. `npm test | tee log` вернёт 0, даже если тесты упали, потому что `tee` отработал успешно.

### Поиск файлов и текста

```bash
find . -name '*.test.ts' -not -path '*/node_modules/*'
find . -type f -size +1M -mtime -1            # файлы больше 1 МБ, изменённые за сутки
grep -rn 'useEffect' src/                     # рекурсивно, с номерами строк
grep -rl 'TODO' src/ | wc -l                  # сколько файлов с TODO
rg 'fetch\(' -t ts                            # ripgrep: быстрее, уважает .gitignore
find . -name '*.orig' -print0 | xargs -0 rm   # -print0/-0 — безопасно для имён с пробелами
```

`xargs` превращает строки со stdin в аргументы команды. Без `-print0`/`-0` имя файла с пробелом разобьётся на два аргумента.

### Разбор логов конвейером

```bash
# Топ-10 IP-адресов по числу запросов
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# Сколько ответов 5xx за последнюю тысячу строк
tail -n 1000 access.log | awk '$9 ~ /^5/' | wc -l

# Следить за логом в реальном времени и фильтровать
tail -f app.log | grep --line-buffered ERROR

# JSON-логи
cat app.log | jq -r 'select(.level == "error") | .msg' | sort | uniq -c | sort -rn
```

Почему `sort` перед `uniq -c`: `uniq` схлопывает только **соседние** одинаковые строки.

### Процессы, порты, сигналы

```bash
lsof -i :3000                  # кто занял порт 3000
ps aux | grep node             # процессы node
kill <pid>                     # SIGTERM — вежливая просьба завершиться
kill -9 <pid>                  # SIGKILL — убить без возможности обработать
kill -USR2 <pid>               # пользовательский сигнал, например снимок кучи Node
top / htop                     # нагрузка CPU и память
jobs, fg, bg, Ctrl+Z           # управление задачами текущей сессии
nohup cmd &                    # запуск в фоне, переживает закрытие терминала
```

| Сигнал | Можно перехватить | Смысл |
|---|---|---|
| `SIGINT` (Ctrl+C) | да | прервать интерактивно |
| `SIGTERM` | да | корректно завершиться — так останавливают Docker и Kubernetes |
| `SIGKILL` (`-9`) | **нет** | немедленная остановка ядром, без очистки |
| `SIGHUP` | да | терминал закрыт; демоны часто перечитывают конфиг |

`kill -9` — последнее средство: процесс не закроет соединения, не допишет файлы, не отпустит блокировки. Связь с деплоем: [корректная остановка в Kubernetes](../15-production/06-nextjs-on-infrastructure.md).

### Сеть

```bash
curl -I https://example.com                  # только заголовки: Cache-Control, ETag, Content-Encoding
curl -sv https://example.com -o /dev/null    # подробно: TLS-рукопожатие, редиректы, заголовки запроса
curl -H 'Accept-Encoding: br' -I URL         # отдаёт ли сервер Brotli
curl -w '%{time_starttransfer}\n' -o /dev/null -s URL   # TTFB из консоли
curl -N URL                                  # без буферизации — проверить стриминг
dig example.com +short                       # DNS: A-записи
dig example.com CNAME
nc -zv host 443                              # открыт ли порт
```

### SSH и удалённые машины

```bash
ssh user@host                         # вход по ключу
ssh -L 5432:localhost:5432 user@host  # проброс порта: локальный 5432 → 5432 на сервере
scp file.tar.gz user@host:/tmp/       # копирование файлов
rsync -avz dist/ user@host:/var/www/  # синхронизация с передачей только изменений
```

Ключи: `ssh-keygen -t ed25519`, публичная часть — на сервер в `~/.ssh/authorized_keys`, приватная остаётся у вас. Удобные алиасы — в `~/.ssh/config`.

### Права и пользователи

```
-rwxr-xr-x  1 app app  1024  script.sh
 └┬┘└┬┘└┬┘
 владелец группа остальные
```

`r = 4`, `w = 2`, `x = 1`. `rwxr-xr-x` = `755`, `rw-r--r--` = `644`, `rw-------` = `600` (так хранят приватный SSH-ключ).

```bash
chmod +x deploy.sh        # сделать исполняемым
chmod 600 ~/.ssh/id_ed25519
chown app:app -R /app     # сменить владельца
sudo -u app whoami        # выполнить от другого пользователя
```

Для каталога `x` означает «можно войти». Без `x` на каталоге файлы внутри недоступны, даже если у самих файлов права есть.

### Переменные окружения и PATH

```bash
export API_URL=https://api.example.com   # видна дочерним процессам
API_URL=http://localhost npm run dev     # только для одной команды
echo $PATH                               # где shell ищет команды
which node                               # какой node будет запущен
env | grep NODE                          # переменные с NODE
```

`npm run` добавляет `node_modules/.bin` в начало `PATH` — поэтому в `scripts` пишут `vitest`, а не `./node_modules/.bin/vitest`. Shebang `#!/usr/bin/env node` в начале файла говорит, каким интерпретатором его запускать.

### Диск и место

```bash
df -h                     # свободно на разделах
du -sh node_modules       # размер каталога
du -sh * | sort -h        # что занимает место в текущем каталоге
```

Частая причина падения CI или сервера: закончилось место (логи, Docker-образы, кэш). `docker system df` и `docker system prune` — для Docker.

## Вопросы с собеседований

<details><summary>Порт 3000 занят, dev-сервер не стартует. Что делаете?</summary>

`lsof -i :3000` — смотрю PID и имя процесса. Если это мой зависший процесс — `kill <pid>` и только если он не реагирует — `kill -9`. Если это чужой нужный сервис — запускаю на другом порту.
</details>

<details><summary>Чем `SIGTERM` отличается от `SIGKILL`?</summary>

`SIGTERM` можно перехватить: приложение закрывает соединения, дописывает данные и завершается само. `SIGKILL` перехватить нельзя — ядро останавливает процесс сразу, без очистки. Оркестраторы сначала шлют `SIGTERM`, а `SIGKILL` — только по таймауту.
</details>

<details><summary>Как из access-лога найти 10 самых частых IP?</summary>

`awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10`. `sort` перед `uniq` обязателен: `uniq` считает только соседние одинаковые строки.
</details>

<details><summary>Почему шаг CI с `npm test | tee test.log` зелёный, хотя тесты упали?</summary>

Код конвейера — это код последней команды, а `tee` завершился успешно. Нужен `set -o pipefail` — тогда конвейер вернёт ошибку, если упала любая из команд.
</details>

<details><summary>Как из консоли проверить, что CDN отдаёт правильные заголовки кэша и сжатие?</summary>

`curl -I URL` — смотрю `Cache-Control`, `Age`, `ETag`, заголовки кэша CDN (например, `x-cache: HIT`). Для сжатия — `curl -I -H 'Accept-Encoding: br, gzip' URL` и смотрю `Content-Encoding`. Время до первого байта — `curl -w '%{time_starttransfer}'`.
</details>

<details><summary>Что значит `chmod 755` и почему приватный SSH-ключ должен быть `600`?</summary>

`755`: владелец читает, пишет и исполняет; группа и остальные — читают и исполняют. `600`: читать и писать может только владелец. SSH отказывается использовать приватный ключ, доступный другим пользователям.
</details>

<details><summary>Почему в `package.json` можно написать `"test": "vitest"`, а в терминале команда `vitest` не находится?</summary>

`npm run` добавляет `node_modules/.bin` в `PATH` только на время выполнения скрипта. В обычном терминале этого каталога в `PATH` нет — используйте `npx vitest` или `npm test`.
</details>

<details><summary>Как найти и удалить все файлы `.orig` после разрешения конфликтов, если в именах есть пробелы?</summary>

`find . -name '*.orig' -print0 | xargs -0 rm` или `find . -name '*.orig' -delete`. `-print0` и `-0` разделяют имена нулевым байтом, поэтому пробелы не ломают аргументы.
</details>

## Практика

1. Скачайте любой access-лог и посчитайте: топ IP, топ URL с ответом 404, долю ответов 5xx.
2. Запустите `node -e "setInterval(() => {}, 1000)"`, найдите его через `lsof`/`ps` и остановите `SIGTERM`. Затем добавьте обработчик `process.on('SIGTERM', ...)` и посмотрите разницу.
3. Проверьте `curl -I` заголовки кэша и сжатия у своего продакшен-сайта для HTML и для файла из `/assets`.
4. Напишите bash-скрипт деплоя с `set -euo pipefail` и убедитесь, что он падает на первой ошибке.

Тест темы: [Unix-консоль для фронтендера](../quizzes/quiz.html?id=17-debugging-git-team/05-unix-console).

## Источники
- [GNU Bash Manual: Redirections](https://www.gnu.org/software/bash/manual/html_node/Redirections.html)
- [The Art of Command Line](https://github.com/jlevy/the-art-of-command-line/blob/master/README-ru.md)
- [curl: Everything curl](https://everything.curl.dev/)
- [ripgrep](https://github.com/BurntSushi/ripgrep)
- [jq Manual](https://jqlang.org/manual/)
- [man7: signal(7)](https://man7.org/linux/man-pages/man7/signal.7.html)
