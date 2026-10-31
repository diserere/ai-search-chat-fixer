// ==UserScript==
// @name         Google AI Search Chat Fixer
// @namespace    https://github.com/diserere/ai-search-chat-fixer
// @version      2.1.1
// @description  Исправляет поведение клавиш в AI-режиме Google Поиска: Enter и Alt+Enter делают перенос строки, а Ctrl+Enter отправляет сообщение.
// @icon         https://www.google.com/favicon.ico
// @author       diserere (https://github.com/diserere)
// @homepageURL  https://github.com/diserere/ai-search-chat-fixer
// @updateURL    https://raw.githubusercontent.com/diserere/ai-search-chat-fixer/main/src/google_ai_search_chat_fixer.user.js
// @downloadURL  https://raw.githubusercontent.com/diserere/ai-search-chat-fixer/main/src/google_ai_search_chat_fixer.user.js
// @match        https://www.google.com/search*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('keydown', function(event) {
        const isAIMode = window.location.href.includes('udm=50');
        if (!isAIMode) return;

        const target = event.target;
        
        const isTextBox = target.tagName === 'TEXTAREA' || 
                          target.getAttribute('contenteditable') === 'true';
        
        if (!isTextBox) return;

        const isPlainEnter = event.key === 'Enter' && !event.ctrlKey && !event.shiftKey && !event.altKey;
        const isAltEnter = event.key === 'Enter' && event.altKey && !event.ctrlKey && !event.shiftKey;

        if (isPlainEnter || isAltEnter) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (target.tagName === 'TEXTAREA') {
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const text = target.value;
                target.value = text.substring(0, start) + "\n" + text.substring(end);
                target.selectionStart = target.selectionEnd = start + 1;
            } else {
                document.execCommand('insertLineBreak');
            }
            
            target.dispatchEvent(new Event('input', {
                bubbles: true
            }));
        }
    }, true);
})();

