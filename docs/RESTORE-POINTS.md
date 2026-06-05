# Restore points

Git annotated tags are the canonical Cursor/GitHub restore points for this theme.

## How to restore

```bash
git fetch origin --tags
git checkout restore-point-2026-06-05   # or another tag below
# optional: npm run locales:build && npm run locales:sync
```

## Tags

| Tag | Commit | Date | Notes |
|-----|--------|------|-------|
| `restore-point-2026-06-05` | *(tagged commit)* | 2026-06-05 | Five-locale i18n lock, markets CHF/EUR/CZK, hero/lp-app refresh, QA reports snapshot |
| `rollback-point-2026-06-03` | `27ed427` | 2026-06-03 | Pre-Opus rollback (incident); see [INCIDENT-2026-06-03.md](./INCIDENT-2026-06-03.md) |

## Cursor

No separate Cursor snapshot API — use the git tag above. To return to this state in Cursor, checkout the tag or reset a branch to the tagged commit.
