# Terraform Issues - What's Causing What?

## Issue #1: Provider Timeout/Hangs ❌
**What you're seeing**: Terraform gets stuck, provider processes use 100% CPU, commands hang

**Root cause**: 
- Known bug in Terraform AWS provider on macOS
- Provider plugin can't start properly
- NOT related to state management
- Happens during `terraform init` and `terraform plan` (before state is even used)

**What fixes it**:
- Killing stuck provider processes
- Clearing `.terraform` cache
- Reinitializing

**Why it keeps happening**:
- Provider processes get stuck in a loop
- macOS security/permissions issues
- Provider plugin bugs

**Solution**: Use the fix script or try on a different machine/CI environment

## Issue #2: State Management ⚠️
**What would happen**: When CodePipeline runs Terraform, state is lost between runs

**Root cause**: 
- Using local state instead of remote (S3)
- CodeBuild environment is ephemeral
- State file doesn't persist

**What this causes**:
- First deployment: Creates everything ✅
- Second deployment: Tries to create everything again (conflicts) ❌
- State is lost when CodeBuild finishes

**Solution**: Set up S3 backend for remote state (what we'll do tomorrow)

## Are They Related?

**Short answer: NO**

- State management doesn't cause timeout issues
- Timeout issues happen BEFORE state is used
- State issues would show up as "resource already exists" errors, not timeouts

## What to Do Tomorrow

1. **Set up S3 backend** for remote state (fixes CodePipeline state issues)
2. **Deploy via CodePipeline** (runs in AWS, avoids macOS provider issues)
3. **Local Terraform** can still be used with the fix script when needed

The good news: When CodePipeline runs Terraform, it runs in AWS CodeBuild (Linux), so you WON'T have the macOS provider timeout issues! The state management fix is just to make sure state persists between runs.
