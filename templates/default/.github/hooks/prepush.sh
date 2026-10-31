#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Running base pre-push checks..."

# Always-run commands
bun install
bun turbo typecheck
bun run format
bun run lint
bun run lint:ws

echo "✅ Base checks passed."

# Check if pushing to 'main'
while read -r local_ref local_sha remote_ref remote_sha
do
  if [[ "$remote_ref" == "refs/heads/main" ]]; then
    echo "🚨 Pushing to 'main' — running additional build check..."
    ## bunx turbo build
    echo "✅ Build completed for main push."
    break
  fi
done

echo "🚀 Pushing to remote!"