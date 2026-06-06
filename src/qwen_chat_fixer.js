// ==UserScript==
// @name         Qwen Chat Fixer
// @namespace    http://tampermonkey.net
// @version      1.0.0
// @description  Fix Enter/Ctrl+Enter behavior in Qwen Chat
// @author       Your Name & AI Assistant
// @match        https://chat.qwen.ai/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Константы селекторов на основе твоего анализа DevTools
    const TEXTAREA_SELECTOR = '.message-input-textarea';
    const SEND_BUTTON_SELECTOR = '.send-button:not(.disabled)';

    function handleKeyDown(e) {
        // Проверяем, что событие произошло именно в нашем поле ввода
        if (!e.target.matches(TEXTAREA_SELECTOR)) return;

        if (e.key === 'Enter') {
            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;
            const isAlt = e.altKey;

            // Кейс 1: Ctrl+Enter (или Cmd+Enter) -> ТЗ: Гарантированная отправка сообщения
            if (isCtrl && !isShift && !isAlt) {
                e.preventDefault();
                e.stopPropagation();
                
                // Ищем кнопку отправки и кликаем по ней
                const sendBtn = document.querySelector(SEND_BUTTON_SELECTOR);
                if (sendBtn) {
                    sendBtn.click();
                }
                return;
            }

            // Кейс 2: Обычный Enter или Alt+Enter -> ТЗ: Перевод строки вместо отправки
            // Кейс 3: Shift+Enter -> Пропускаем через нашу логику для унификации
            if (!isCtrl) {
                e.preventDefault();
                e.stopPropagation();

                // Вставляем перенос строки через execCommand, чтобы не сломать Virtual DOM
                try {
                    document.execCommand('insertText', false, '\n');
                } catch (err) {
                    // Резервный вариант, если execCommand где-то заблокирован
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const value = e.target.value;
                    e.target.value = value.substring(0, start) + '\n' + value.substring(end);
                    e.target.selectionStart = e.target.selectionEnd = start + 1;
                    
                    // Триггерим нативное событие input для реактивности
                    e.target.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    }

    // Слушаем события на этапе погружения (capture: true), чтобы перехватить Enter 
    // до того, как его обработают внутренние скрипты Ant Design на Qwen
    window.addEventListener('keydown', handleKeyDown, true);
})();
