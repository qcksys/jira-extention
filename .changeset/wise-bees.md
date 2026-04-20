---
"@qcksys/jira-extention": patch
---

fix release workflow: set `privatePackages: { version: true, tag: true }` in `.changeset/config.json` so `changeset tag` actually creates git tags for this private package (default skips `"private": true` packages)
