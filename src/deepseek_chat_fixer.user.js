// ==UserScript==
// @name         DeepSeek Chat Fixer 1.4.0
// @namespace    https://github.com/diserere/ai-search-chat-fixer
// @version      1.4.0
// @description  Исправляет поведение клавиш в чате DeepSeek: Enter делает перенос строки, а Ctrl+Enter отправляет сообщение через симуляцию событий.
// @icon         https://deepseek.com/favicon.ico
// @author       diserere (https://github.com/diserere)
// @homepageURL  https://github.com/diserere/ai-search-chat-fixer
// @match        https://chat.deepseek.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Флаг-предохранитель, чтобы избежать бесконечного цикла при симуляции клавиш
    let isSimulating = false;

    function handleKeyDown(e) {
        if (isSimulating) return;
        if (e.target.tagName !== 'TEXTAREA' || e.target.name !== 'search') return;

        const isEnter = e.key === 'Enter';
        const isCtrl = e.ctrlKey || e.metaKey; // Поддержка Cmd для macOS
        const isShift = e.shiftKey;
        const isAlt = e.altKey;

        if (isEnter) {
            // Сценарий 1: Ctrl + Enter -> Эмуляция отправки через «чистый» Enter
            if (isCtrl && !isShift && !isAlt) {
                e.preventDefault();
                e.stopPropagation();

                // Проверяем, активна ли кастомная кнопка отправки (чтобы не отправлять пустое поле)
                const container = e.target.closest('form') || e.target.parentElement;
                const sendButton = container ? container.querySelector('div[role="button"].ds-button') : null;
                if (sendButton && sendButton.classList.contains('ds-button--disabled')) {
                    return; // Кнопка заблокирована фреймворком, отправку не производим
                }

                // Генерируем нативное событие обычного Enter, на которое среагирует сам DeepSeek
                isSimulating = true;
                const nativeEnterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                e.target.dispatchEvent(nativeEnterEvent);
                isSimulating = false;
            } 
            // Сценарий 2: Enter или Alt+Enter -> Перенос строки со скроллом (Shift+Enter браузер обработает сам)
            else if (!isShift) {
                e.preventDefault();
                e.stopPropagation();

                // Нативно вставляем перенос строки. 
                // Это заставляет Vue/React обновить состояние, изменить высоту и выполнить автоскролл.
                document.execCommand('insertText', false, '\n');
            }
        }
    }

    // Ловим нажатия на этапе погружения (capture = true)
    window.addEventListener('keydown', handleKeyDown, true);
})();
