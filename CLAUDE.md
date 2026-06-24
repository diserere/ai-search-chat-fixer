# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Search Chat Fixer** — a collection of UserScripts (Tampermonkey/Violentmonkey) that fix keyboard UX in AI chat web interfaces. Each script remaps `Enter` to insert a newline and `Ctrl+Enter` to send, preventing accidental message submission.

No build system, no dependencies, no test framework. Scripts are copied directly into a userscript manager.

## Source Files

| Script | Path | Target | Run at |
|--------|------|--------|--------|
| Google AI Search Chat Fixer | `src/google_ai_search_chat_fixer.js` | `https://www.google.com/search*` (AI mode only) | `document-start` |
| DeepSeek Chat Fixer | `src/deepseek_chat_fixer.js` | `https://chat.deepseek.com/*` | `document-end` |
| Qwen Chat Fixer | `src/qwen_chat_fixer.js` | `https://chat.qwen.ai/*` | `document-start` |

Each script is self-contained — single IIFE, one `keydown` listener on `window` (capture phase). No shared modules.

## How to Test

1. Edit the target script in `src/`
2. Copy full file content into Tampermonkey/Violentmonkey
3. Save (Ctrl+S) and reload the target page

For Google AI Search: URL must contain `udm=50` (AI mode) — the script exits early otherwise.

## Per-Script Architecture

### Google AI Search Chat Fixer (`src/google_ai_search_chat_fixer.js`)
- Guard: URL includes `udm=50`
- Guard: target is `TEXTAREA` or `contenteditable=true`
- `Enter` / `Alt+Enter`: prevent default, inject newline, dispatch `input` event
- `Ctrl+Enter`: not handled — Google's native send trigger fires
- Newline injection: `value` splice for `TEXTAREA`; `document.execCommand('insertLineBreak')` for `contenteditable`

### DeepSeek Chat Fixer (`src/deepseek_chat_fixer.js`)
- Guard: target is `TEXTAREA[name="search"]`
- `Ctrl+Enter`: dispatches a native `KeyboardEvent('keydown', { key: 'Enter' })` — DeepSeek listens for plain Enter to send
- `Enter` / `Alt+Enter`: `document.execCommand('insertText', false, '\n')` — preserves Vue/React reactivity and auto-scroll
- Uses `isSimulating` flag to prevent infinite loop when synthesizing the send event
- Checks send button disabled state before dispatching send

### Qwen Chat Fixer (`src/qwen_chat_fixer.js`)
- Guard: target matches `.message-input-textarea` (Ant Design)
- `Ctrl+Enter`: clicks `.send-button:not(.disabled)` directly
- `Enter` / `Alt+Enter`: `document.execCommand('insertText', false, '\n')` with fallback to manual `value` splice if `execCommand` throws

## Code Style Rules

- **Vertical formatting**: multi-property objects and event constructors must be one property per line (diff-friendly). Never single-line dense bundles.
- **Minimalist comments**: only non-trivial workarounds or architectural constraints. No obvious descriptive comments.
- **Language**: Russian for user-facing strings and comments (matches the project's locale).

## Development Workflow (Trunk-Based)

- Work in short-lived branches: `patch/vX.Y.Z-description` or `feat/vX.Y.Z-description`
- Sync: `git checkout main && git pull --rebase`
- One feature or one bugfix per commit — never mix infrastructure changes with logic fixes
- Merge locally and push; no PRs
- Every code change must come with a Conventional Commit message

## Versioning (SemVer 2.0.0)

Version is in each script's UserScript header `@version`:
- **MAJOR**: architectural changes, rewrites, breaking migrations
- **MINOR**: new features (e.g., supporting a new platform)
- **PATCH**: bugfixes, stability, selector/match tweaks

## Key Constraints

- Each script must remain scoped to its target origin via `@match`. No cross-origin injection.
- No data collection, caching, or exfiltration.
- `isTrusted: false` synthetic events may be blocked by SPAs — prefer direct DOM manipulation (`execCommand`, `value` splice, `click()`) over `KeyboardEvent` dispatch where possible. DeepSeek script is the exception where event dispatch is the only working path.
