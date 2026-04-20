# @qcksys/jira-extention

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
