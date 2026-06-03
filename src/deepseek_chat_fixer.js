// ==UserScript==
// @name         DeepSeek Chat Fixer 1.2.0
// @namespace    https://github.com
// @version      1.2.0
// @description  Исправляет поведение клавиш в чате DeepSeek: Enter делает перенос строки со скроллом, а Ctrl+Enter отправляет сообщение.
// @author       diserere
// @match        https://chat.deepseek.com/*
// @icon         https://deepseek.comfavicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function handleKeyDown(e) {
        // Проверяем, что фокус на нужном поле ввода
        if (e.target.tagName !== 'TEXTAREA' || e.target.name !== 'search') return;

        const isEnter = e.key === 'Enter';
        const isCtrl = e.ctrlKey || e.metaKey; // Поддержка Cmd для macOS
        const isShift = e.shiftKey;
        const isAlt = e.altKey;

        if (isEnter) {
            // Сценарий 1: Ctrl + Enter (или Cmd + Enter) -> Отправка сообщения
            if (isCtrl && !isShift && !isAlt) {
                e.preventDefault();
                e.stopPropagation();

                // Ищем родительский контейнер формы/ввода
                const container = e.target.closest('form') || e.target.parentElement;
                
                // Ищем кастомную кнопку-див по стабильным классам и роли
                const sendButton = container ? container.querySelector('div[role="button"].ds-button') : null;

                // Проверяем, что кнопка найдена и она НЕ заблокирована (нет класса отключения)
                if (sendButton && !sendButton.classList.contains('ds-button--disabled')) {
                    sendButton.click();
                }
            } 
            // Сценарий 2: Enter или Alt+Enter -> Перенос строки со скроллом (Shift+Enter браузер обработает сам)
            else if (!isShift) {
                e.preventDefault();
                e.stopPropagation();

                // Нативно вставляем перенос строки. 
                // Это заставляет Vue/React обновить состояние, изменить высоту и выполнить автоскролл.
                document.execCommand('insertText', false, '\n');
            }
        }
    }

    // Перехватываем события на этапе погружения
    window.addEventListener('keydown', handleKeyDown, true);
})();
