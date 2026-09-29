#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WIKI_REMOTE="https://github.com/manvenpratap/CricOS.wiki.git"
TMP_WIKI_DIR="/tmp/cricos-github-wiki-sync"

echo "==> Syncing wiki/*.md to ${WIKI_REMOTE}..."
if git ls-remote "${WIKI_REMOTE}" >/dev/null 2>&1; then
  rm -rf "${TMP_WIKI_DIR}"
  git clone "${WIKI_REMOTE}" "${TMP_WIKI_DIR}"
  cp -R "${ROOT_DIR}/wiki/"*.md "${TMP_WIKI_DIR}/"
  cd "${TMP_WIKI_DIR}"
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "docs(wiki): sync CricOS engineering and product wiki"
    git push origin HEAD
    echo "✓ Published all Wiki pages to https://github.com/manvenpratap/CricOS/wiki"
  else
    echo "✓ GitHub Wiki is already up to date."
  fi
else
  echo "ℹ GitHub requires clicking 'Create the first page' -> 'Save Page' once at:"
  echo "  https://github.com/manvenpratap/CricOS/wiki/_new"
  echo "  Meanwhile, all 8 Wiki pages are live and browsable in-repo at:"
  echo "  https://github.com/manvenpratap/CricOS/blob/main/wiki/Home.md"
fi
