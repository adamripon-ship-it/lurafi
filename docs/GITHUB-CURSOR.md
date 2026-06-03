# GitHub + Cursor — full access setup

Cursor agents use **your** GitHub identity (`gh` + `git`), not a separate super-user. On a personal account, **you are already the owner** — that is the highest level for `adamripon-ship-it/lurafi`.

## 1. Maximum `gh` CLI scopes (done via refresh)

Run locally (approve in the browser when prompted):

```bash
gh auth refresh -h github.com -s repo,workflow,delete_repo,admin:org,admin:public_key,gist,notifications,user,project,write:packages,read:packages,read:org
gh auth setup-git
gh auth status
```

| Scope | What it enables in Cursor |
|-------|---------------------------|
| `repo` | Push, PRs, private repos, repo settings, collaborators |
| `workflow` | Create/edit GitHub Actions, push `.github/workflows/*` |
| `delete_repo` | Delete repositories (only when you ask) |
| `admin:org` | Org members/teams/settings (if you join an org) |
| `user` | Profile, emails, follow (account management APIs) |
| `project` | GitHub Projects |
| `read:org` | List orgs and org repos |

Verify:

```bash
gh auth status
# Token scopes should list repo, workflow, delete_repo, admin:org, ...
```

## 2. Git credentials for Cursor terminal

```bash
gh auth setup-git
```

Git push/pull from Cursor’s terminal then uses the same token as `gh`.

## 3. Optional: fine-grained PAT (backup)

If OAuth scopes are ever insufficient:

1. GitHub → **Settings** → **Developer settings** → **Fine-grained tokens**
2. Resource: **Only select repositories** → `lurafi`
3. Permissions: **Contents** Read and write, **Actions** Read and write, **Metadata** Read, **Pull requests** Read and write, **Workflows** Read and write, **Administration** Read and write
4. Save token locally only:

```bash
# ~/.zshrc or .env (NEVER commit)
export GITHUB_TOKEN="github_pat_..."
```

`.env` is gitignored in this repo.

## 4. Repository admin (lurafi)

You already have on `adamripon-ship-it/lurafi`:

```json
{ "admin": true, "maintain": true, "push": true, "pull": true, "triage": true }
```

**Branch protection on `main` (enabled):**

- Required status check: `theme-check` (strict)
- PR required before merge (0 approvals)
- Force push and branch delete disabled

To change: GitHub → repo **Settings → Branches → main**.

## 5. What “super admin” cannot mean

| Request | Reality |
|---------|---------|
| Cursor creates new GitHub **user accounts** | Not possible via API |
| Access another person’s repos | Needs their invite or PAT |
| Org-wide billing / enterprise policies | Needs **Organization Owner** on that org |
| Bypass branch protection | Owners can; use only when intentional |

## 6. Cursor rule

Project rule: `.cursor/rules/github-full-access.mdc` — tells the agent to use `gh` for all GitHub work with owner-level rights.

## 7. CI deploy secrets (Shopify, not GitHub admin)

For **Deploy theme** workflow — GitHub → repo **Settings → Secrets → Actions** → environment **`production`**:

- `SHOPIFY_CLI_THEME_TOKEN` — Theme Access app token on the **target** store
- `SHOPIFY_FLAG_STORE` — e.g. `your-new-store.myshopify.com`

Full new-account setup: [SETUP-NEW-SHOPIFY-ACCOUNT.md](./SETUP-NEW-SHOPIFY-ACCOUNT.md).

## Security

- Revoke any token ever pasted in chat
- Prefer `gh auth login` over committing PATs
- Rotate fine-grained PATs every 90 days if used
