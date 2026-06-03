// ==UserScript==
// @name         DeepSeek Chat Fixer (Enter to New Line, Ctrl+Enter to Send)
// @namespace    https://github.com
// @version      1.1.0
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
        if (e.target.tagName !== 'TEXTAREA' || e.target.name !== 'search') return;

        const isEnter = e.key === 'Enter';
        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;
        const isAlt = e.altKey;

        if (isEnter) {
            // Сценарий 1: Ctrl + Enter -> Отправка сообщения
            if (isCtrl && !isShift && !isAlt) {
                e.preventDefault();
                e.stopPropagation();

                // Ищем кнопку отправки по более точному селектору DeepSeek
                // Обычно кнопка отправки имеет атрибут или находится внутри контейнера формы
                const form = e.target.closest('form') || e.target.parentElement;
                // Ищем кнопку, которая визуально является кнопкой отправки (часто последняя кнопка в форме)
                const sendButton = form ? (form.querySelector('button[type="submit"]') || form.querySelector('button:last-child')) : null;

                if (sendButton && !sendButton.disabled) {
                    sendButton.click();
                } else {
                    // Если кнопку не нашли или она disabled, пробуем отправить форму напрямую
                    const closestForm = e.target.closest('form');
                    if (closestForm) {
                        closestForm.requestSubmit();
                    }
                }
            } 
            // Сценарий 2: Enter или Alt+Enter -> Безопасный перенос строки со скроллом
            else if (!isShift) {
                e.preventDefault();
                e.stopPropagation();

                // Используем execCommand для нативной вставки символа перевода строки.
                // Это автоматически заставит фреймворк DeepSeek корректно обработать ввод,
                // изменить высоту textarea и проскроллить её вниз вслед за курсором.
                document.execCommand('insertText', false, '\n');
            }
        }
    }

    // Слушаем события клавиатуры на этапе погружения (Capture), чтобы перехватить Enter до того, как сработает логика сайта
    window.addEventListener('keydown', handleKeyDown, true);
})();
