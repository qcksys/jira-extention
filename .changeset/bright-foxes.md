---
"@qcksys/jira-extention": minor
---

Port UI improvements from the AG timesheet extension and add a new reporting-format setting:

- App shell now uses a fixed-height popup (600px) with a sticky nav and a scrollable content area.
- Logger shows a target badge ("Jira" / "No Jira tab is active") so it's obvious when you're on the wrong tab.
- Settings switch to grouped sections (Parsing / Time / Jira) with auto-save on blur and a save-state indicator.
- State is now backed by `@tanstack/react-query`; the textarea persists across nav via a ComposerProvider.
- New `reportingFormat` setting (`seconds` | `days`). When set to `days`, worklogs post to Jira as `timeSpent: "Xd"` (e.g. `0.3d`) so Jira renders the duration in its own day units instead of the raw `timeSpentSeconds`. Defaults to `seconds`.
