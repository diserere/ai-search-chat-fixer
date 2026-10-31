// ==UserScript==
// @name         DeepSeek Chat Fixer
// @namespace    https://github.com/diserere/ai-search-chat-fixer
// @version      1.5.1
// @description  Исправляет поведение клавиш в чате DeepSeek: Enter делает перенос строки, а Ctrl+Enter отправляет сообщение.
// @icon         https://deepseek.com/favicon.ico
// @author       diserere (https://github.com/diserere)
// @homepageURL  https://github.com/diserere/ai-search-chat-fixer
// @updateURL    https://raw.githubusercontent.com/diserere/ai-search-chat-fixer/main/src/deepseek_chat_fixer.user.js
// @downloadURL  https://raw.githubusercontent.com/diserere/ai-search-chat-fixer/main/src/deepseek_chat_fixer.user.js
// @match        https://chat.deepseek.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Синтетический Enter снова попадает в наш обработчик — без флага будет бесконечный цикл
    let isSimulating = false;

    function handleKeyDown(e) {
        if (isSimulating) return;
        if (e.target.tagName !== 'TEXTAREA' || e.target.name !== 'search') return;

        const isEnter = e.key === 'Enter';
        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;
        const isAlt = e.altKey;

        if (isEnter) {
            if (isCtrl && !isShift && !isAlt) {
                e.preventDefault();
                e.stopPropagation();

                const container = e.target.closest('form') || e.target.parentElement;
                const sendButton = container ? container.querySelector('div[role="button"].ds-button') : null;
                if (sendButton && sendButton.classList.contains('ds-button--disabled')) {
                    return;
                }

                // DeepSeek отправляет по обычному Enter; клик по его кнопке-div не срабатывает
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
            else if (!isShift) {
                e.preventDefault();
                e.stopPropagation();

                // execCommand, а не правка value: фреймворк видит изменение, растягивает поле и скроллит
                document.execCommand('insertText', false, '\n');
            }
        }
    }

    window.addEventListener('keydown', handleKeyDown, true);
})();
