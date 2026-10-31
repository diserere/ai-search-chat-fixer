# CLAUDE.md

Инструкции для Claude Code при работе с этим репозиторием.

## Обзор проекта

**AI Chat Fixers** — коллекция UserScript'ов (Tampermonkey/Violentmonkey), исправляющих поведение клавиатуры в веб-интерфейсах AI-чатов. Каждый скрипт переназначает `Enter` на перенос строки, а `Ctrl+Enter` (`Cmd+Enter` на macOS) — на отправку, чтобы исключить случайную отправку недописанного сообщения.

Сборки, зависимостей и тестового фреймворка нет. Скрипты копируются в менеджер userscript'ов как есть.

## Исходные файлы

| Скрипт | Путь | Цель | Run at |
|--------|------|------|--------|
| Google AI Search Chat Fixer | `src/google_ai_search_chat_fixer.user.js` | `https://www.google.com/search*` (только AI-режим) | `document-start` |
| DeepSeek Chat Fixer | `src/deepseek_chat_fixer.user.js` | `https://chat.deepseek.com/*` | `document-end` |
| Qwen Chat Fixer | `src/qwen_chat_fixer.user.js` | `https://chat.qwen.ai/*` | `document-start` |
| ChatGPT Chat Fixer | `src/chatgpt_chat_fixer.user.js` | `https://chatgpt.com/*` | `document-start` |

Каждый скрипт самодостаточен: один IIFE, один обработчик `keydown` на `window` в фазе capture. Общих модулей нет.

## Тестирование

Вручную, в браузере:

1. Отредактировать скрипт в `src/` и поднять `@version`.
2. Установить скрипт в Tampermonkey/Violentmonkey: по raw-ссылке из ветки (`https://raw.githubusercontent.com/diserere/ai-search-chat-fixer/<branch>/src/<file>.user.js`, после push) либо копированием содержимого файла.
3. Перезагрузить целевую страницу.
4. Прогнать сценарий из `docs/testing/prompts/testing_prompt.md` (кодировка клавиш e/a/s/c, маркеры `n`/`F`/`f`).

Отчёты о тестировании — в `docs/testing/reports/`.

Агент может проводить исследование и тестирование сам через Claude in Chrome (сессия запускается `claude --chrome`; в VS Code-расширении интеграция недоступна): читать DOM, выполнять JS в контексте страницы, внедрять код скрипта (эквивалент `@grant none`) и нажимать реальные клавиши (`isTrusted: true`). Перед отправкой сообщений в чат нужно получить отдельное согласие пользователя в текущей сессии; разрешение из прошлых сессий не переносится. Финальная проверка установки через Tampermonkey/Violentmonkey — за пользователем.

Приёмы, проверенные на практике:
- **Исследование — по одному способу за вызов**, после каждого проверять `location.href` и содержимое поля ввода. Любая программная вставка (`insertText('\n')`, `insertParagraph`) может сработать как Enter и отправить сообщение — в ChatGPT так и вышло.
- **Скрипт внедрять через JS, а клавиши нажимать реальные** (инструмент клавиатуры, не `dispatchEvent`) — только так события `isTrusted` и тест соответствует реальному использованию.
- **Многострочный текст вводить построчно**, нажимая реальный `Enter` между строками: ввод тестового промпта сам становится проверкой скрипта. Не вводить текст с `\n` одной строкой — это может отправить сообщение.
- **Скролл проверять через JS** вместо маркера `n`: найти ближайший прокручиваемый контейнер поля и сравнить прямоугольник каретки (`getSelection().getRangeAt(0).getBoundingClientRect()`) с его границами, а также `scrollTop`.
- Работать в собственной вкладке и закрывать её по завершении; для пакетов действий использовать `browser_batch`.

Для Google AI Search URL должен содержать `udm=50` (AI-режим), иначе скрипт ничего не делает.

## Архитектура скриптов

### Google AI Search Chat Fixer (`src/google_ai_search_chat_fixer.user.js`)
- Guard: URL содержит `udm=50`.
- Guard: target — `TEXTAREA` или `contenteditable=true`.
- `Enter` / `Alt+Enter`: preventDefault, вставка переноса строки, dispatch события `input`.
- `Ctrl+Enter` не обрабатывается — срабатывает нативная отправка Google.
- Вставка переноса: splice `value` для `TEXTAREA`; `document.execCommand('insertLineBreak')` для `contenteditable`.

### DeepSeek Chat Fixer (`src/deepseek_chat_fixer.user.js`)
- Guard: target — `TEXTAREA[name="search"]`.
- `Ctrl+Enter`: dispatch синтетического `KeyboardEvent('keydown', { key: 'Enter' })` — DeepSeek отправляет по обычному Enter.
- `Enter` / `Alt+Enter`: `document.execCommand('insertText', false, '\n')` — сохраняет реактивность фреймворка и автоскролл.
- Флаг `isSimulating` предотвращает бесконечный цикл при генерации события отправки.
- Перед отправкой проверяется disabled-состояние кнопки отправки.

### Qwen Chat Fixer (`src/qwen_chat_fixer.user.js`)
- Guard: target соответствует `.message-input-textarea` (Ant Design).
- `Ctrl+Enter`: программный клик по `.send-button:not(.disabled)`.
- `Enter` / `Alt+Enter` / `Shift+Enter` (всё без Ctrl): `document.execCommand('insertText', false, '\n')` с фолбеком на ручной splice `value`.

### ChatGPT Chat Fixer (`src/chatgpt_chat_fixer.user.js`)
- Guard: target внутри `.ProseMirror`; пропуск при IME-композиции (`isComposing` / `keyCode === 229`).
- Скрипт не вызывает `preventDefault` и не генерирует событий — он подменяет модификаторы у trusted-события через `Object.defineProperty` в фазе capture:
  - `Enter` / `Alt+Enter` → `shiftKey: true`, `altKey: false` (нативный Shift+Enter — новый абзац);
  - `Ctrl+Enter` / `Cmd+Enter` → `ctrlKey: false`, `metaKey: false` (нативный Enter — отправка).
- Почему не `execCommand`: ProseMirror трактует `insertParagraph` и `insertText('\n')` как Enter, то есть как отправку; синтетические `KeyboardEvent` игнорирует. Подробности — в `docs/testing/reports/ChatGPT_Chat_Fixer_test_reports.md`.

## Стиль кода

- **Вертикальное форматирование**: объекты и конструкторы событий с несколькими свойствами — по одному свойству на строку (удобно для diff).
- **Минимум комментариев**: только для нетривиальных обходных решений и архитектурных ограничений. Никаких очевидных описательных комментариев.
- **Язык**: русский для пользовательских строк и комментариев.

## Версионирование (SemVer 2.0.0)

Версия хранится в `@version` заголовка UserScript каждого скрипта; скрипты версионируются независимо.

Скрипты обновляются автоматически: `@updateURL` / `@downloadURL` указывают на raw-файл в `main`, поэтому **мерж в `main` = релиз** для всех установленных копий. Правила:
- `@version` поднимать при каждом изменении скрипта — менеджер обновляет только при росте версии. Тестовая копия из ветки с более высокой версией не будет перезаписана версией из `main`.
- `@name` и `@namespace` не менять и не включать в `@name` версию: по этой паре менеджер идентифицирует скрипт, при изменении обновление установится как новый скрипт.
- Имя файла — `*.user.js`; при переименовании обновить `@updateURL` / `@downloadURL`.

Какую часть версии поднимать:
- **MAJOR** — архитектурные изменения, переписывание, несовместимые миграции.
- **MINOR** — новая функциональность (например, поддержка новой платформы).
- **PATCH** — исправления ошибок, стабильность, правки селекторов и `@match`.

## Бэклог

Ведётся в `docs/backlog.md` (источник истины) с дублированием в GitHub Issues. При заведении задачи — добавлять в оба места. PR, закрывающий задачу, содержит `Closes #N` и переносит пункт в раздел «Сделано» файла бэклога.

Задачи, найденные при приёмочном тестировании PR (в том числе не связанные с ним), заводятся в Issues и вносятся в бэклог **коммитом в тот же PR** — отдельный PR ради правки бэклога не нужен. То же для задач, закрытых без изменений кода (например, «не дефект»): issue закрывается, пункт переносится в «Сделано» с пометкой.

## Структура репозитория

```
.
├── CLAUDE.md                 # Этот файл — инструкции для агента
├── .claude/
│   └── settings.json         # Настройки Claude Code (запрет чтения docs/archive/)
├── .gitignore
├── README.md                 # Публичное описание проекта
├── docs/
│   ├── backlog.md            # Бэклог задач (дублируется в GitHub Issues)
│   ├── archive/              # Исторический контекст (агенту недоступен)
│   └── testing/              # Тестовые артефакты
│       ├── prompts/          # Промпт для ручного тестирования через чат-бота
│       └── reports/          # Отчёты о тестировании
└── src/                      # Исходный код юзерскриптов
    ├── chatgpt_chat_fixer.user.js
    ├── deepseek_chat_fixer.user.js
    ├── google_ai_search_chat_fixer.user.js
    └── qwen_chat_fixer.user.js
```

`docs/archive/` содержит исторический контекст прошлых итераций (ретроспективы, промпты для других чат-ботов) и не является инструкциями для агента. Чтение закрыто через `permissions.deny` в `.claude/settings.json`.

## Ключевые ограничения

- Каждый скрипт ограничен своим origin через `@match`. Никаких кросс-доменных инъекций.
- Никакого сбора, кэширования или передачи данных.
- Синтетические события с `isTrusted: false` могут блокироваться SPA — по возможности предпочитать прямую работу с DOM (`execCommand`, splice `value`, `click()`) вместо dispatch `KeyboardEvent`. Исключение — DeepSeek, где dispatch события — единственный работающий путь.
- Для редакторов, которые сами обрабатывают клавиши (ProseMirror и т.п.), надёжнее всего подменять модификаторы у реального trusted-события (как в ChatGPT): поведение совпадает с нативным без зависимости от селекторов кнопок.
