// ==UserScript==
// @name         AI Search Chat Fixer
// @namespace    http://tampermonkey.net
// @version      1.2
// @description  Intercepts Enter globally in input areas.
// @author       You
// @match        http://*/*
// @match        https://*/*
// @allFrames    true
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Слушаем событие нажатия клавиши на этапе погружения (capture phase)
    window.addEventListener('keydown', function(event) {
        // Проверяем, что фокус находится в текстовом поле ввода (textarea или contenteditable)
        const isTextBox = event.target.tagName === 'TEXTAREA' || 
                          event.target.getAttribute('contenteditable') === 'true';
        
        if (!isTextBox) return;

        // Кейс 1: Нажат просто Enter (без Ctrl, Shift, Alt)
        if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            // Останавливаем оригинальный скрипт Гугла, который пытается отправить форму
            event.stopPropagation();
            event.preventDefault();

            // Вставляем перенос строки программно в зависимости от типа поля
            if (event.target.tagName === 'TEXTAREA') {
                const start = event.target.selectionStart;
                const end = event.target.selectionEnd;
                const text = event.target.value;
                event.target.value = text.substring(0, start) + "\n" + text.substring(end);
                event.target.selectionStart = event.target.selectionEnd = start + 1;
            } else {
                // Для contenteditable (богатый текст, если Гугл использует его)
                document.execCommand('insertLineBreak');
            }
            
            // Триггерим событие изменения ввода, чтобы интерфейс увидел новый текст
            event.target.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Кейс 2: Нажат Ctrl + Enter
        if (event.key === 'Enter' && event.ctrlKey) {
            // Имитируем отправку: убираем модификатор Ctrl и пускаем событие дальше,
            // чтобы оригинальный скрипт сайта подумал, что это был обычный Enter для отправки.
            event.stopPropagation();
            event.preventDefault();
            
            const e = new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13,
                code: 'Enter',
                which: 13,
                bubbles: true,
                cancelable: true
            });
            event.target.dispatchEvent(e);
        }
    }, true); // Флаг true активирует фазу перехвата (capture), обгоняя скрипты страницы
})();

