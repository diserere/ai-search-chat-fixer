// ==UserScript==
// @name         ChatGPT Chat Fixer
// @namespace    https://github.com/diserere/ai-search-chat-fixer
// @version      1.0.0
// @description  Исправляет поведение клавиш в чате ChatGPT: Enter делает перенос строки, а Ctrl+Enter отправляет сообщение.
// @icon         https://chatgpt.com/favicon.ico
// @author       diserere (https://github.com/diserere)
// @homepageURL  https://github.com/diserere/ai-search-chat-fixer
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const EDITOR_SELECTOR = '.ProseMirror';

    // Подменяем модификаторы у самого trusted-события, а не генерируем новое:
    // ProseMirror игнорирует синтетические события, а execCommand('insertParagraph')
    // и insertText('\n') он трактует как Enter, то есть как отправку.
    function overrideModifiers(e, modifiers) {
        for (const [name, value] of Object.entries(modifiers)) {
            Object.defineProperty(e, name, {
                get: () => value
            });
        }
    }

    function handleKeyDown(e) {
        if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
        if (!(e.target instanceof Element) || !e.target.closest(EDITOR_SELECTOR)) return;

        const isCtrl = e.ctrlKey || e.metaKey;

        if (isCtrl && !e.shiftKey && !e.altKey) {
            overrideModifiers(e, {
                ctrlKey: false,
                metaKey: false
            });
        } else if (!isCtrl && !e.shiftKey) {
            overrideModifiers(e, {
                shiftKey: true,
                altKey: false
            });
        }
    }

    window.addEventListener('keydown', handleKeyDown, true);
})();
