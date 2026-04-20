---
"@qcksys/jira-extention": patch
---

fix release workflow:

- strip the leading `v` from single-package tags (e.g. `v0.2.3`) when deriving the `VERSION`, so CHANGELOG lookup and release title no longer get a `vv` prefix or miss the `## 0.2.3` section
- make GitHub release creation idempotent — `gh release edit` + `gh release upload --clobber` when a release for the tag already exists, so partial-failure runs can be re-triggered and recover
