// ==UserScript==
// @name         Qwen Chat Fixer
// @namespace    https://github.com/diserere/ai-search-chat-fixer
// @version      1.1.1
// @description  Исправляет поведение клавиш в чате Qwen: Enter делает перенос строки, а Ctrl+Enter отправляет сообщение.
// @icon         https://chat.qwen.ai/favicon.ico
// @author       diserere (https://github.com/diserere)
// @homepageURL  https://github.com/diserere/ai-search-chat-fixer
// @updateURL    https://raw.githubusercontent.com/diserere/ai-search-chat-fixer/main/src/qwen_chat_fixer.user.js
// @downloadURL  https://raw.githubusercontent.com/diserere/ai-search-chat-fixer/main/src/qwen_chat_fixer.user.js
// @match        https://chat.qwen.ai/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const TEXTAREA_SELECTOR = '.message-input-textarea';
    const SEND_BUTTON_SELECTOR = '.send-button:not(.disabled)';

    function handleKeyDown(e) {
        if (!e.target.matches(TEXTAREA_SELECTOR)) return;

        if (e.key === 'Enter') {
            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;
            const isAlt = e.altKey;

            if (isCtrl && !isShift && !isAlt) {
                e.preventDefault();
                e.stopPropagation();
                
                const sendBtn = document.querySelector(SEND_BUTTON_SELECTOR);
                if (sendBtn) {
                    sendBtn.click();
                }
                return;
            }

            if (!isCtrl) {
                e.preventDefault();
                e.stopPropagation();

                // execCommand, а не правка value: фреймворк видит изменение, растягивает поле и скроллит
                try {
                    document.execCommand('insertText', false, '\n');
                } catch (err) {
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

    window.addEventListener('keydown', handleKeyDown, true);
})();
