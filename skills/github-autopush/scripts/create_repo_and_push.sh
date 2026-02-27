#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:?Usage: create_repo_and_push.sh <owner/repo> <commit-message> [public|private]}"
MSG="${2:-Initial commit}"
VIS="${3:-public}"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is not installed." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

# Create repo if missing
if gh repo view "$TARGET" >/dev/null 2>&1; then
  echo "Repo exists: $TARGET"
else
  gh repo create "$TARGET" --"$VIS" --confirm
fi

URL="https://github.com/$TARGET.git"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$URL"
else
  git remote add origin "$URL"
fi

git add -A
if ! git diff --cached --quiet; then
  git commit -m "$MSG" || true
fi

git branch -M main
git push -u origin main

echo "Done: $URL"
