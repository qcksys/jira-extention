# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser extension ("Jira Time Logger") for bulk-posting Jira Cloud worklogs from a freeform text block. Built with [WXT](https://wxt.dev) + React 19 + Tailwind v4 + shadcn/ui (base-nova style).

## Commands

This repo uses Vite+ (`vp`) **and** WXT. WXT owns the build/dev pipeline; Vite+ wraps tooling and package management. Because `dev`/`build`/`test` exist as `package.json` scripts, always prefix with `vp run` — `vp dev` would start Vite's dev server instead of WXT.

- `vp run dev` — WXT dev (Chromium). `vp run dev:firefox` for Firefox.
- `vp run build` / `vp run build:firefox` — production build to `.output/`.
- `vp run zip` / `vp run zip:firefox` — package for store upload.
- `vp check` — format + lint + type-check (Vite+ built-in).
- `vp test` — Vitest (import test utilities from `vite-plus/test`, not `vitest`).
- `vp run format` — Biome format write. `vp run format:check` for CI.
- `vp install` — install deps (runs `wxt prepare` postinstall to regenerate `.wxt/`).

Formatting/linting: **Biome** (linter disabled, formatter only — 4-space indent, single quotes, JSX double quotes, 100 col). WXT generates `.wxt/tsconfig.json` which `tsconfig.json` extends — re-run `vp install` or `pnpx wxt prepare` if path aliases break.

## Architecture

Three entrypoints in `src/entrypoints/`:

1. **`popup/`** — React UI (`components/App.tsx` → `Logger` and `Settings` routes via `HashRouter`). User pastes a text block, sees a live parse preview, clicks "Log time".
2. **`options/`** — separate React page (same App shell) served as the extension's options UI.
3. **`content.ts`** — runs on `*://*.atlassian.net/*`. Listens for `{ type: 'log-worklogs', entries }` runtime messages, POSTs each entry to `${origin}/rest/api/2/issue/{key}/worklog` via `ky` with `credentials: 'include'` (reuses the user's Jira session), returns `{ results }`.

**Why a content script?** Authentication. The popup can't send authenticated requests to Jira — cookies are scoped to the Jira tab. The popup (`Logger.submit`) finds the active `*.atlassian.net` tab via `browser.tabs.query` and forwards work through `browser.tabs.sendMessage`. If the user isn't on a Jira tab, submission fails with a clear error.

**Parser flow** (`src/utils/parser.ts`): the input is line-split; lines are matched against two user-configurable regexes from settings:

- `dateRegex` — must capture a `date` named group; sets the "current date" for following entries.
- `entryRegex` — must capture `key`, `hours`, `comment` named groups.

Entries are grouped per date. `startTimeMode: 'fixed'` gives every entry that date's `startTime`; `'sequential'` stacks them back-to-back starting at `startTime`. `timeUnit` determines whether `hours` is decimal hours or minutes. Output `started` uses Jira's expected `YYYY-MM-DDTHH:mm:ss.SSS±HHMM` format with the **local** timezone offset.

**Settings storage** (`src/utils/config.ts`): WXT's `storage` API under key `local:settings`, merged with `DEFAULT_SETTINGS` on read. `watchSettings` subscribes to changes.

**Shared types** live in `src/utils/types.ts` — notably `WorklogRequest`/`WorklogResponse` are the message contract between popup and content script. Keep both sides in sync.

## Conventions

- Path alias `~/*` → `src/*` (set in `tsconfig.json`; shadcn `components.json` aliases also use `~/`).
- `#imports` is a WXT virtual module exposing `storage`, `defineContentScript`, etc. — do not try to import these from `wxt` directly.
- Manifest is declared in `wxt.config.ts`, not a raw `manifest.json`. Host permissions are `*://*.atlassian.net/*`; adding a non-Atlassian host needs both a manifest update and updating `JIRA_HOST_RE`/content-script `matches`.
- shadcn components live under `src/components/ui/` (style `base-nova`, icon library `lucide`). Add new ones via `vp dlx shadcn@latest add <name>`.
- TS is `strict` with `noUnusedLocals`/`noUnusedParameters` on — dead params must be prefixed with `_`.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ built-in commands (`vp dev`, `vp build`, `vp test`, etc.) always run the Vite+ built-in tool, not any `package.json` script of the same name. To run a custom script that shares a name with a built-in command, use `vp run <script>`. For example, if you have a custom `dev` script that runs multiple services concurrently, run it with `vp run dev`, not `vp dev` (which always starts Vite's dev server).
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## CI Integration

For GitHub Actions, consider using [`voidzero-dev/setup-vp`](https://github.com/voidzero-dev/setup-vp) to replace separate `actions/setup-node`, package-manager setup, cache, and install steps with a single action.

```yaml
- uses: voidzero-dev/setup-vp@v1
  with:
    cache: true
- run: vp check
- run: vp test
```

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->
