// ==UserScript==
// @name         DeepSeek Chat Fixer (Enter to New Line, Ctrl+Enter to Send)
// @namespace    https://github.com
// @version      1.0.0
// @description  Исправляет поведение клавиш в чате DeepSeek: Enter делает перенос строки, а Ctrl+Enter отправляет сообщение.
// @author       Ваше Имя / diserere
// @match        https://chat.deepseek.com/*
// @icon         https://deepseek.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Функция обработки нажатий клавиш
    function handleKeyDown(e) {
        // Проверяем, что фокус именно на текстовом поле ввода чата
        if (e.target.tagName !== 'TEXTAREA' || e.target.name !== 'search') return;

        const isEnter = e.key === 'Enter';
        const isCtrl = e.ctrlKey || e.metaKey; // Поддержка Cmd для macOS
        const isShift = e.shiftKey;
        const isAlt = e.altKey;

        if (isEnter) {
            // Сценарий 1: Осознанная отправка через Ctrl + Enter (или Cmd + Enter)
            if (isCtrl && !isShift && !isAlt) {
                // Ищем кнопку отправки рядом с textarea (обычно это кнопка внутри формы или соседний элемент)
                // На DeepSeek кнопка отправки часто имеет специфический svg-значок. Попробуем найти её через родительский контейнер.
                const form = e.target.closest('form') || e.target.parentElement;
                const sendButton = form ? form.querySelector('button:not([disabled])') : null;

                if (sendButton) {
                    e.preventDefault();
                    sendButton.click(); // Симулируем клик по кнопке отправки
                } else {
                    // Альтернативный вариант, если кнопка не найдена: отправляем форму напрямую
                    const closestForm = e.target.closest('form');
                    if (closestForm) {
                        e.preventDefault();
                        closestForm.requestSubmit();
                    }
                }
            } 
            // Сценарий 2: Обычный Enter, Shift+Enter или Alt+Enter -> строго перенос строки
            else {
                e.stopPropagation(); // Останавливаем перехват события встроенными скриптами DeepSeek
                
                // Если нажат чистый Enter или Alt+Enter (поведение по умолчанию для Shift+Enter и так перенос в браузере)
                if (!isShift) {
                    e.preventDefault();
                    
                    const textarea = e.target;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = textarea.value;

                    // Вставляем перенос строки в позицию курсора
                    textarea.value = text.substring(0, start) + "\n" + text.substring(end);

                    // Возвращаем курсор на место сразу после вставленного переноса строки
                    textarea.selectionStart = textarea.selectionEnd = start + 1;

                    // Триггерим событие инпута, чтобы интерфейс (React/Vue) DeepSeek заметил изменение высоты поля
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    }

    // Слушаем события клавиатуры на этапе погружения (Capture), чтобы перехватить Enter до того, как сработает логика сайта
    window.addEventListener('keydown', handleKeyDown, true);
})();
