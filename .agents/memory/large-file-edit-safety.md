---
name: Large-file edit corruption risk
description: Edit tool can silently duplicate/truncate content on large or risky multi-line replacements; safer alternative pattern.
---

On a ~1000-line TypeScript file, the Edit tool silently duplicated file content wholesale (line count roughly doubled twice) and truncated a string literal mid-edit when a `$` character was involved in the replacement text. Reproduced twice on the same file in one session.

**Why:** Root cause unconfirmed, but risk seems to scale with file size and with special characters (e.g. `$`, template-literal syntax) inside old/new strings passed to Edit.

**How to apply:** For large files or multi-block replacements where corruption would be costly to detect, prefer a Node.js script (via ShellExec) that does exact-match `content.split(old).join(new)` per edit, asserts the expected occurrence count (typically 1) before writing, and only writes the file once all assertions pass. Reserve the Edit tool for small files or very short, uniquely-matched, special-character-free snippets. `python3` is not available in this environment — use `node`.
