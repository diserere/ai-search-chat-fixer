// ==UserScript==
// @name         AI Search Chat Fixer
// @namespace    http://tampermonkey.net
// @version      2.0.3
// @description  Safely maps Enter to Newline using direct DOM injection and leaves Ctrl+Enter untouched.
// @author       You
// @match        https://www.google.com/search*
// @allFrames    true
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('keydown', function(event) {
        const target = event.target;

        const isTextBox = target.tagName === 'TEXTAREA' ||
                          target.getAttribute('contenteditable') === 'true';

        if (!isTextBox) return;

        if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
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

            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, true);
})();

