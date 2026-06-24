# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Search Chat Fixer** — a UserScript (Tampermonkey/Violentmonkey) that fixes keyboard UX in Google's AI chat search interface. Intercepts `Enter`/`Alt+Enter` to insert newlines instead of submitting, and maps `Ctrl+Enter` to send the message.

Single source file: `src/ai_search_chat_fixer.js`. No build system, no dependencies, no test framework. The script is copied directly into a userscript manager.

## How to "Build" / Run

There is no build step. To test changes:
1. Edit `src/ai_search_chat_fixer.js`
2. Copy the full file content into Tampermonkey/Violentmonkey editor
3. Save (Ctrl+S) and reload a Google Search page with `udm=50` in the URL

The script runs at `document-start` and only activates when `window.location.href.includes('udm=50')`.

## Architecture

The entire logic is a single IIFE with one `keydown` listener on `window` (capture phase). Flow:
1. Guard: URL must contain `udm=50` (AI mode)
2. Guard: target must be a `TEXTAREA` or `contenteditable=true`
3. If `Enter` or `Alt+Enter` (no Ctrl/Shift): prevent default, inject `\n` via DOM manipulation, dispatch `input` event
4. `Ctrl+Enter` is intentionally not handled here — Google's built-in send trigger fires naturally

DOM injection strategy: for `TEXTAREA`, manually splice `value` at cursor position; for `contenteditable`, use `document.execCommand('insertLineBreak')`.

## Code Style Rules

- **Vertical formatting**: multi-property objects and event constructors must be one property per line (diff-friendly). Never single-line dense bundles.
- **Minimalist comments**: only non-trivial workarounds or architectural constraints. No obvious descriptive comments.
- **Language**: Russian for user-facing strings and comments (matches the project's locale).

## Development Workflow (Trunk-Based)

- Work in short-lived branches: `patch/vX.Y.Z-description` or `feat/vX.Y.Z-description`
- Sync: `git checkout master && git pull --rebase`
- One feature or one bugfix per commit — never mix infrastructure changes with logic fixes
- Merge locally and push; no PRs
- Every code change must come with a Conventional Commit message

## Versioning (SemVer 2.0.0)

Version is in the UserScript header `@version`:
- **MAJOR**: architectural changes, rewrites, breaking migrations
- **MINOR**: new features (e.g., supporting a new platform)
- **PATCH**: bugfixes, stability, selector/match tweaks

## Key Constraint

The script must remain scoped to `https://google.com*` (via `@match`). It must not inject into Google homepage, Images, Maps, or third-party sites. No data collection, caching, or exfiltration.
