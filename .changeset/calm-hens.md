---
"@qcksys/jira-extention": patch
---

fix release workflow: gate zip build and GitHub release on `git tag --points-at HEAD` instead of the `changesets/action` `published` output, which can silently miss new tags
