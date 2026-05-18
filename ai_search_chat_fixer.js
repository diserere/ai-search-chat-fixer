// ==UserScript==
// @name         AI Search Chat Fixer (Final Stable)
// @namespace    http://tampermonkey.net
// @version      2.1.0
// @description  Safely maps Enter to Newline using direct DOM injection and leaves Ctrl+Enter untouched.
// @author       You
// @match        http://*/*
// @match        https://*/*
// @allFrames    true
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('keydown', function(event) {
        const target = event.target;
        
        // Проверяем фокус в поле ввода
        const isTextBox = target.tagName === 'TEXTAREA' || 
                          target.getAttribute('contenteditable') === 'true';
        
        if (!isTextBox) return;

        // Фильтруем ТОЛЬКО одиночный Enter
        if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            // Полностью блокируем отправку
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // Жесткая вставка символа переноса строки в обход логики Гугла
            if (target.tagName === 'TEXTAREA') {
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const text = target.value;
                target.value = text.substring(0, start) + "\n" + text.substring(end);
                target.selectionStart = target.selectionEnd = start + 1;
            } else {
                // Если Гугл использует contenteditable div
                document.execCommand('insertLineBreak');
            }
            
            // Оповещаем фреймворк страницы, что текст изменился
            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Все остальные комбинации (Ctrl+Enter, Shift+Enter) скрипт просто игнорирует,
        // отдавая их на откуп встроенным фичам браузера и Google.
    }, true);
})();

