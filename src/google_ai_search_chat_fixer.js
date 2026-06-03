// ==UserScript==
// @name         AI Search Chat Fixer
// @namespace    http://tampermonkey.net
// @version      2.0.5
// @description  Safely maps Enter and Alt+Enter to Newline using direct DOM injection with AI context validation.
// @author       You
// @match        https://www.google.com/search*
// @allFrames    true
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('keydown', function(event) {
        // Проверяем, что мы находимся именно в ИИ-режиме диалога Google
        const isAIMode = window.location.href.includes('udm=50');
        if (!isAIMode) return;

        const target = event.target;
        
        const isTextBox = target.tagName === 'TEXTAREA' || 
                          target.getAttribute('contenteditable') === 'true';
        
        if (!isTextBox) return;

        // Выделяем условия для чистого Enter и Alt+Enter
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

