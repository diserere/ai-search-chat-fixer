# Бэклог

Источник истины — этот файл (версионируется вместе с кодом). GitHub Issues — рабочие копии для обсуждения и автозакрытия через PR.

Правила:
- Каждый пункт ссылается на свой issue.
- PR, закрывающий issue (`Closes #N`), в том же PR переносит пункт в раздел «Сделано».
- Новый пункт добавляется сразу и сюда, и в Issues.

## Открытые

### Фичи

| # | Задача | Приоритет |
|---|--------|-----------|
| [#8](https://github.com/diserere/ai-search-chat-fixer/issues/8) | Унифицировать заголовки и комментарии скриптов (версия из `@name` уже убрана в #9) | low |

### Дефекты

| # | Скрипт | Задача | Приоритет |
|---|--------|--------|-----------|
| [#3](https://github.com/diserere/ai-search-chat-fixer/issues/3) | все | Enter при IME-композиции превращается в перенос строки — нет проверки `isComposing` | medium |
| [#4](https://github.com/diserere/ai-search-chat-fixer/issues/4) | Google | `Cmd+Enter` на macOS вставляет перенос вместо отправки — не проверяется `metaKey` | medium |
| [#5](https://github.com/diserere/ai-search-chat-fixer/issues/5) | Google | Splice `value` в `TEXTAREA` может не обновлять состояние фреймворка *(требует проверки)* | low |
| [#6](https://github.com/diserere/ai-search-chat-fixer/issues/6) | Qwen | Фолбек в `catch` недостижим: `execCommand` возвращает `false`, а не бросает | low |
| [#7](https://github.com/diserere/ai-search-chat-fixer/issues/7) | DeepSeek | Селектор кнопки отправки может найти не ту кнопку *(требует проверки)* | low |

## Сделано

| # | Задача | Где |
|---|--------|-----|
| [#10](https://github.com/diserere/ai-search-chat-fixer/issues/10) | Поддержка ChatGPT (chatgpt.com) — ChatGPT Chat Fixer 1.0.0 | `src/chatgpt_chat_fixer.user.js` |
| [#9](https://github.com/diserere/ai-search-chat-fixer/issues/9) | Автообновление через `@updateURL` / `@downloadURL`, файлы переименованы в `*.user.js` | все скрипты |
