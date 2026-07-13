---
name: Per-login access-code gate
description: How Corvenza Capital Finance gates every non-admin login behind an admin-issued access code, and how it avoids duplicating one-time account/card creation.
---

The access-code check for login is driven by a session flag (`req.session.accessCodeVerified`), not by whether the user already has an account. Login sets it `false` for non-admins and `true` for admins; verifying a code sets it `true` for that session only.

**Why:** the user wanted every login gated, not just first-time signup. Gating on "does this user have an account yet" (the old approach) only ever fires once per user. A session flag re-fires on every fresh login while staying independent of whether the underlying account already exists.

**How to apply:** any endpoint that should be blocked until the code is verified must go through a middleware that checks this session flag (admins bypass it automatically). The one-time bank-account/card creation logic must key off "does this user already have an account row" (not off "has this session verified a code before") so it runs exactly once ever, even though the code-verification endpoint itself runs on every login. Access codes can optionally target a specific user (`accessCodes.userId`); a null `userId` on a code makes it usable by anyone (kept for backward compatibility with older untargeted codes).
