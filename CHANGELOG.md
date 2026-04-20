# @qcksys/jira-extention

## 0.3.0

### Minor Changes

- 0b7a206: Port UI improvements from the AG timesheet extension and add a new reporting-format setting:

  - App shell now uses a fixed-height popup (600px) with a sticky nav and a scrollable content area.
  - Logger shows a target badge ("Jira" / "No Jira tab is active") so it's obvious when you're on the wrong tab.
  - Settings switch to grouped sections (Parsing / Time / Jira) with auto-save on blur and a save-state indicator.
  - State is now backed by `@tanstack/react-query`; the textarea persists across nav via a ComposerProvider.
  - New `reportingFormat` setting (`seconds` | `days`). When set to `days`, worklogs post to Jira as `timeSpent: "Xd"` (e.g. `0.3d`) so Jira renders the duration in its own day units instead of the raw `timeSpentSeconds`. Defaults to `seconds`.

## 0.2.4

### Patch Changes

- 497b265: fix release workflow:

  - strip the leading `v` from single-package tags (e.g. `v0.2.3`) when deriving the `VERSION`, so CHANGELOG lookup and release title no longer get a `vv` prefix or miss the `## 0.2.3` section
  - make GitHub release creation idempotent — `gh release edit` + `gh release upload --clobber` when a release for the tag already exists, so partial-failure runs can be re-triggered and recover

## 0.2.3

### Patch Changes

- bc8d73e: fix release workflow: set `privatePackages: { version: true, tag: true }` in `.changeset/config.json` so `changeset tag` actually creates git tags for this private package (default skips `"private": true` packages)

## 0.2.2

### Patch Changes

- c74ecc7: fix release workflow: gate zip build and GitHub release on `git tag --points-at HEAD` instead of the `changesets/action` `published` output, which can silently miss new tags

## 0.2.1

### Patch Changes

- 0787d99: fix release workflow: pin Node 24 and call `changeset` binary directly so `vp exec` banner output doesn't break the tag-detection parsing that gates the zip build

## 0.2.0

### Minor Changes

- 12cd862: - add `days` time unit option to settings and parser
  - add configurable `hoursPerDay` setting (default 8) used by the `days` unit

## 0.1.0

### Minor Changes

- Initial Jira Time Logger extension: WXT + React popup/options UI that parses a freeform text block via user-configurable date/entry regexes and posts worklogs through a content script to `*.atlassian.net` using the active session. Supports fixed and sequential start-time modes, decimal-hours or minutes input, and persisted settings via WXT storage.
