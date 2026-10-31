// ==UserScript==
// @name         Qwen Chat Fixer
// @namespace    https://github.com/diserere/ai-search-chat-fixer
// @version      1.0.0
// @description  Fixes Enter/Ctrl+Enter behavior in Qwen Chat (chat.qwen.ai) to prevent accidental line sends.
// @icon         https://chat.qwen.ai/favicon.ico
// @author       diserere (https://github.com/diserere) & Google AI Search Assistant
// @homepageURL  https://github.com/diserere/ai-search-chat-fixer
// @match        https://chat.qwen.ai/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Селекторы элементов интерфейса Qwen (Ant Design)
    const TEXTAREA_SELECTOR = '.message-input-textarea';
    const SEND_BUTTON_SELECTOR = '.send-button:not(.disabled)';

    function handleKeyDown(e) {
        // Перехватываем события только внутри целевого поля ввода
        if (!e.target.matches(TEXTAREA_SELECTOR)) return;

        if (e.key === 'Enter') {
            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;
            const isAlt = e.altKey;

            // Кейс 1: Ctrl+Enter (или Cmd+Enter) -> Гарантированная отправка сообщения
            if (isCtrl && !isShift && !isAlt) {
                e.preventDefault();
                e.stopPropagation();
                
                const sendBtn = document.querySelector(SEND_BUTTON_SELECTOR);
                if (sendBtn) {
                    sendBtn.click();
                }
                return;
            }

            // Кейс 2: Обычный Enter, Alt+Enter или Shift+Enter -> Перевод строки и скролл
            if (!isCtrl) {
                e.preventDefault();
                e.stopPropagation();

                // Безопасная вставка символа для сохранения реактивности Virtual DOM
                try {
                    document.execCommand('insertText', false, '\n');
                } catch (err) {
                    // Резервный фолбек на случай блокировки execCommand браузером
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const value = e.target.value;
                    e.target.value = value.substring(0, start) + '\n' + value.substring(end);
                    e.target.selectionStart = e.target.selectionEnd = start + 1;
                    
                    e.target.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    }

    // Перехват на этапе погружения (capture: true) для обхода внутренних обработчиков чата
    window.addEventListener('keydown', handleKeyDown, true);
})();
