---
name: github-autopush
description: Automate GitHub repository workflows with gh + git. Use when the user wants to create a GitHub repo, configure remote origin, commit changes, push branches, or open pull requests from a local project.
---

# GitHub AutoPush Skill

Use this skill to run safe, repeatable GitHub flows.

## Preconditions

1. Ensure `git` exists.
2. Ensure `gh` (GitHub CLI) exists.
3. Ensure GitHub auth is valid:
   - `gh auth status`
   - If not authenticated: `gh auth login` (or set `GH_TOKEN`).

If `gh` is missing, install it first (environment-specific), then continue.

## Default safety rules

- Confirm target repo URL before first push.
- Use local repo config (`git config user.name/email`) unless user asks global.
- Do not force-push unless explicitly requested.
- Show final remote and branch after push.

## Workflows

### 1) Create new GitHub repo and push current project

Run:

```bash
scripts/create_repo_and_push.sh <owner/repo> "<commit-message>" [public|private]
```

Example:

```bash
scripts/create_repo_and_push.sh frederikernst27-byte/Mealflex "Initial commit" public
```

### 2) Commit and push existing repo

Run:

```bash
scripts/quick_push.sh "<commit-message>" [branch]
```

Example:

```bash
scripts/quick_push.sh "Add mealplan schema" main
```

### 3) Create feature branch and PR

Run:

```bash
git checkout -b feature/<name>
# make changes
scripts/quick_push.sh "<commit-message>" feature/<name>
gh pr create --fill --base main --head feature/<name>
```

## Troubleshooting

- `gh: command not found` → install GitHub CLI.
- `could not read Username for 'https://github.com'` → authenticate with `gh auth login` or set `GH_TOKEN`.
- `remote origin already exists` → `git remote set-url origin <url>`.
- `Author identity unknown` → set `git config user.name` and `git config user.email`.
