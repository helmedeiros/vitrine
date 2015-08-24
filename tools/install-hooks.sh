#!/bin/sh
set -e

source_dir="$(cd "$(dirname "$0")"; pwd)/hooks"
target_dir="$(git rev-parse --git-dir 2>/dev/null)/hooks"

not_in_a_git_checkout() {
  [ -z "$target_dir" ] || [ ! -d "$target_dir" ]
}

if not_in_a_git_checkout; then
  exit 0
fi

for hook in pre-commit commit-msg; do
  cp "$source_dir/$hook" "$target_dir/$hook"
  chmod +x "$target_dir/$hook"
done

echo "git hooks installed into $target_dir"
