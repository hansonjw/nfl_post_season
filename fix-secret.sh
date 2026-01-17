#!/bin/bash
# Script to remove Google OAuth secret from REGION_CHECK.md in git history

# The secret to replace
OLD_SECRET="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"
NEW_SECRET="YOUR-GOOGLE-CLIENT-SECRET"

# Use git filter-branch to rewrite history
git filter-branch --force --tree-filter "
if [ -f REGION_CHECK.md ]; then
  sed -i.bak 's|$OLD_SECRET|$NEW_SECRET|g' REGION_CHECK.md
  rm -f REGION_CHECK.md.bak 2>/dev/null || true
fi
" --prune-empty --tag-name-filter cat -- --all

# Clean up backup refs
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Secret removed from git history"
echo "⚠️  You'll need to force push: git push origin --force --all"
