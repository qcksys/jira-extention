# @qcksys/jira-extention

## 0.2.0

### Minor Changes

- 12cd862: - add `days` time unit option to settings and parser
  - add configurable `hoursPerDay` setting (default 8) used by the `days` unit

## 0.1.0

### Minor Changes

- Initial Jira Time Logger extension: WXT + React popup/options UI that parses a freeform text block via user-configurable date/entry regexes and posts worklogs through a content script to `*.atlassian.net` using the active session. Supports fixed and sequential start-time modes, decimal-hours or minutes input, and persisted settings via WXT storage.
