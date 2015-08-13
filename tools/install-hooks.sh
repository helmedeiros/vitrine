#!/bin/sh
# Installs project git hooks into the local .git/hooks/ directory.
# Idempotent; run after every `npm install` to keep hooks in sync.

set -e

DIR="$(cd "$(dirname "$0")"; pwd)"
HOOKS_DIR="$DIR/hooks"
TARGET="$(git rev-parse --git-dir 2>/dev/null)/hooks"

if [ -z "$TARGET" ] || [ ! -d "$TARGET" ]; then
  # Not a git checkout (e.g. installed as an npm dependency). Skip.
  exit 0
fi

for hook in pre-commit commit-msg; do
  cp "$HOOKS_DIR/$hook" "$TARGET/$hook"
  chmod +x "$TARGET/$hook"
done

echo "git hooks installed into $TARGET"
