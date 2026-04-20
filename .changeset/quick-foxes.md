---
"@qcksys/jira-extention": patch
---

fix release workflow: pin Node 24 and call `changeset` binary directly so `vp exec` banner output doesn't break the tag-detection parsing that gates the zip build
