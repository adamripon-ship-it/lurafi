# Theme save points

Dated snapshots of **mitipi.eu** theme code. Use tags/branches here to revert GitHub or redeploy a known-good live theme.

| Date | Name | Tag | Commit | Notes |
|------|------|-----|--------|-------|
| 2026-06-26 | mitipi-live-sync | `savepoint/2026-06-26-mitipi-live-sync` | `20aa6d8` | Live mitipi.eu synced with GitHub `main`; CMS PR #20 |

Details: [SAVEPOINT-2026-06-26.md](./SAVEPOINT-2026-06-26.md)

## Quick restore

```bash
git fetch origin --tags
git checkout savepoint/2026-06-26-mitipi-live-sync
npm ci && npm run predeploy && npm run theme:push:live
```
