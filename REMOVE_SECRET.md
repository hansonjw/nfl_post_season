# Removing Google OAuth Secret from Git History

## Quick Fix (if secret is only in uncommitted changes)

If the secret hasn't been pushed to GitHub yet:

1. **Remove from current changes:**
   ```bash
   git reset HEAD REGION_CHECK.md  # If it's staged
   git checkout -- REGION_CHECK.md  # If it's modified
   ```

2. **The secret has already been removed from REGION_CHECK.md** - just commit the fix:
   ```bash
   git add REGION_CHECK.md
   git commit -m "Remove Google OAuth secret from REGION_CHECK.md"
   ```

## If Secret Was Already Pushed to GitHub

If the secret was already committed and pushed, you need to remove it from git history:

### Option 1: Use git-filter-repo (Recommended)

```bash
# Install git-filter-repo if needed
# brew install git-filter-repo  # macOS
# pip install git-filter-repo    # Linux

# Remove the secret from all history
git filter-repo --invert-paths --path REGION_CHECK.md

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

### Option 2: Use BFG Repo-Cleaner

```bash
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/

# Remove the secret
java -jar bfg.jar --replace-text secrets.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

### Option 3: Manual git filter-branch (if above tools unavailable)

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch REGION_CHECK.md" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

## After Removing from History

1. **Rotate the secret** in Google Cloud Console (the exposed secret is compromised)
2. **Update GitHub secrets** with the new secret value
3. **Notify your team** if this is a shared repository

## Prevention

- ✅ `terraform.tfvars` is already in `.gitignore`
- ✅ Use GitHub Secrets for CI/CD (already configured)
- ✅ Never commit secrets to documentation files
- ✅ Use `.env.example` files with placeholder values
