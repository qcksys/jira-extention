# Jira Time Logger

Browser extension for bulk-posting Jira Cloud worklogs from a freeform text block. Paste a list of tickets, hours, and comments into the popup and log them all at once — the extension reuses your active Jira session, so there are no tokens to manage.

## Install (development)

Requires [Vite+](https://vitepl.us) (the `vp` CLI). WXT owns the build pipeline.

```sh
vp install          # installs deps + runs `wxt prepare`
vp run dev          # Chromium (loads .output/chrome-mv3 as an unpacked extension)
vp run dev:firefox  # Firefox
```

> Note: the `dev`/`build`/`test`/`zip` scripts must be invoked via `vp run <script>`. Bare `vp dev` would start Vite's dev server instead of WXT.

## Usage

1. Open a Jira Cloud tab (`*.atlassian.net`) and make sure you are logged in.
2. Click the extension icon. Paste entries into the textarea. Default format:
   ```
   2026-04-19
   ABC-123 | 1.5 | Reviewed PR
   ABC-124 | 0.5 | Standup
   2026-04-20
   ABC-125 | 2 | Bugfix
   ```
3. Check the live parse preview, then click **Log time**. Each entry is POSTed to `/rest/api/2/issue/{key}/worklog` from the Jira tab.

The date/entry regexes, time unit (hours or minutes), and start-time mode (fixed per day or sequential back-to-back) are all configurable on the **Settings** page.

## How it works

Authentication is the reason for the split architecture: the popup cannot send authenticated requests to Jira because cookies are scoped to the Jira origin.

- `src/entrypoints/popup/` — React UI. Parses input, shows a preview, sends worklog entries to the active Jira tab via `browser.tabs.sendMessage`.
- `src/entrypoints/options/` — standalone React page for editing settings.
- `src/entrypoints/content.ts` — content script on `*.atlassian.net`. Receives messages and POSTs each entry via `ky` with `credentials: 'include'`.
- `src/utils/parser.ts` — line-splits input, matches the date/entry regexes, groups entries per day, formats `started` as `YYYY-MM-DDTHH:mm:ss.SSS±HHMM` in the local timezone.
- `src/utils/config.ts` — settings persistence via WXT's `storage` API under `local:settings`.

## Commands

| Command                                 | What it does                          |
| --------------------------------------- | ------------------------------------- |
| `vp run dev` / `vp run dev:firefox`     | WXT dev build with HMR                |
| `vp run build` / `vp run build:firefox` | Production build to `.output/`        |
| `vp run zip` / `vp run zip:firefox`     | Package for store upload              |
| `vp check`                              | Format, lint, and type-check          |
| `vp test`                               | Vitest (import from `vite-plus/test`) |
| `vp run format`                         | Biome format (write)                  |

## Stack

WXT · React 19 · Tailwind v4 · shadcn/ui (base-nova) · ky · Biome (formatter only) · TypeScript strict.
