# CLAUDE.md

Инструкции для Claude Code при работе с этим репозиторием.

## Обзор проекта

**AI Chat Fixers** — коллекция UserScript'ов (Tampermonkey/Violentmonkey), исправляющих поведение клавиатуры в веб-интерфейсах AI-чатов. Каждый скрипт переназначает `Enter` на перенос строки, а `Ctrl+Enter` (`Cmd+Enter` на macOS) — на отправку, чтобы исключить случайную отправку недописанного сообщения.

Сборки, зависимостей и тестового фреймворка нет. Скрипты копируются в менеджер userscript'ов как есть.

## Исходные файлы

| Скрипт | Путь | Цель | Run at |
|--------|------|------|--------|
| Google AI Search Chat Fixer | `src/google_ai_search_chat_fixer.js` | `https://www.google.com/search*` (только AI-режим) | `document-start` |
| DeepSeek Chat Fixer | `src/deepseek_chat_fixer.js` | `https://chat.deepseek.com/*` | `document-end` |
| Qwen Chat Fixer | `src/qwen_chat_fixer.js` | `https://chat.qwen.ai/*` | `document-start` |
| ChatGPT Chat Fixer | `src/chatgpt_chat_fixer.js` | `https://chatgpt.com/*` | `document-start` |

Каждый скрипт самодостаточен: один IIFE, один обработчик `keydown` на `window` в фазе capture. Общих модулей нет.

## Тестирование

Вручную, в браузере:

1. Отредактировать скрипт в `src/`.
2. Скопировать содержимое файла целиком в Tampermonkey/Violentmonkey.
3. Сохранить (Ctrl+S) и перезагрузить целевую страницу.
4. Прогнать сценарий из `docs/testing/prompts/testing_prompt.md` (кодировка клавиш e/a/s/c, маркеры `n`/`F`/`f`).

Отчёты о тестировании — в `docs/testing/reports/`.

Агент может проводить исследование и тестирование сам через Claude in Chrome (сессия запускается `claude --chrome`; в VS Code-расширении интеграция недоступна): читать DOM, выполнять JS в контексте страницы, внедрять код скрипта (эквивалент `@grant none`) и нажимать реальные клавиши (`isTrusted: true`). Перед отправкой сообщений в чат нужно получить отдельное согласие пользователя в текущей сессии; разрешение из прошлых сессий не переносится. Финальная проверка установки через Tampermonkey/Violentmonkey — за пользователем.

Для Google AI Search URL должен содержать `udm=50` (AI-режим), иначе скрипт ничего не делает.

## Архитектура скриптов

### Google AI Search Chat Fixer (`src/google_ai_search_chat_fixer.js`)
- Guard: URL содержит `udm=50`.
- Guard: target — `TEXTAREA` или `contenteditable=true`.
- `Enter` / `Alt+Enter`: preventDefault, вставка переноса строки, dispatch события `input`.
- `Ctrl+Enter` не обрабатывается — срабатывает нативная отправка Google.
- Вставка переноса: splice `value` для `TEXTAREA`; `document.execCommand('insertLineBreak')` для `contenteditable`.

### DeepSeek Chat Fixer (`src/deepseek_chat_fixer.js`)
- Guard: target — `TEXTAREA[name="search"]`.
- `Ctrl+Enter`: dispatch синтетического `KeyboardEvent('keydown', { key: 'Enter' })` — DeepSeek отправляет по обычному Enter.
- `Enter` / `Alt+Enter`: `document.execCommand('insertText', false, '\n')` — сохраняет реактивность фреймворка и автоскролл.
- Флаг `isSimulating` предотвращает бесконечный цикл при генерации события отправки.
- Перед отправкой проверяется disabled-состояние кнопки отправки.

### Qwen Chat Fixer (`src/qwen_chat_fixer.js`)
- Guard: target соответствует `.message-input-textarea` (Ant Design).
- `Ctrl+Enter`: программный клик по `.send-button:not(.disabled)`.
- `Enter` / `Alt+Enter` / `Shift+Enter` (всё без Ctrl): `document.execCommand('insertText', false, '\n')` с фолбеком на ручной splice `value`.

### ChatGPT Chat Fixer (`src/chatgpt_chat_fixer.js`)
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

Версия хранится в `@version` заголовка UserScript каждого скрипта; скрипты версионируются независимо. Менеджер userscript'ов определяет обновление по `@version`, поэтому версию нужно поднимать при каждом изменении кода скрипта:
- **MAJOR** — архитектурные изменения, переписывание, несовместимые миграции.
- **MINOR** — новая функциональность (например, поддержка новой платформы).
- **PATCH** — исправления ошибок, стабильность, правки селекторов и `@match`.

## Бэклог

Ведётся в `docs/backlog.md` (источник истины) с дублированием в GitHub Issues. При заведении задачи — добавлять в оба места. PR, закрывающий задачу, содержит `Closes #N` и переносит пункт в раздел «Сделано» файла бэклога.

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
    ├── chatgpt_chat_fixer.js
    ├── deepseek_chat_fixer.js
    ├── google_ai_search_chat_fixer.js
    └── qwen_chat_fixer.js
```

`docs/archive/` содержит исторический контекст прошлых итераций (ретроспективы, промпты для других чат-ботов) и не является инструкциями для агента. Чтение закрыто через `permissions.deny` в `.claude/settings.json`.

## Ключевые ограничения

- Каждый скрипт ограничен своим origin через `@match`. Никаких кросс-доменных инъекций.
- Никакого сбора, кэширования или передачи данных.
- Синтетические события с `isTrusted: false` могут блокироваться SPA — по возможности предпочитать прямую работу с DOM (`execCommand`, splice `value`, `click()`) вместо dispatch `KeyboardEvent`. Исключение — DeepSeek, где dispatch события — единственный работающий путь.
- Для редакторов, которые сами обрабатывают клавиши (ProseMirror и т.п.), надёжнее всего подменять модификаторы у реального trusted-события (как в ChatGPT): поведение совпадает с нативным без зависимости от селекторов кнопок.
