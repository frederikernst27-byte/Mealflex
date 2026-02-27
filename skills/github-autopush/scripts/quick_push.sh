#!/usr/bin/env bash
set -euo pipefail

MSG="${1:-chore: update}"
BRANCH="${2:-main}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository" >&2
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$MSG"
fi

git branch -M "$BRANCH"
git push -u origin "$BRANCH"

echo "Pushed to origin/$BRANCH"
