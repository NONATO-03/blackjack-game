# Git Flow Workflow

Complete guide to working with this repository using Git Flow.

## Branch Structure

```
main (production-ready)
  ↑
  └─ release/v*.*.* (prepare release)
       ↑
       └─ develop (integration branch)
            ↑
            ├─ feature/* (new features)
            └─ hotfix/* (critical fixes)
```

## Branches

### 🔴 main
- **Purpose**: Production-ready code
- **Protection**: Only merges from release branches
- **Names**: 1 permanent branch
- **Merges **:
  ```bash
  git checkout main
  git merge --no-ff release/v1.0.0
  git tag v1.0.0
  ```

### 🟢 develop
- **Purpose**: Integration branch (next release)
- **Protection**: Only merges from feature/release/hotfix branches
- **Base branch**: For all feature work
- **Example**:
  ```bash
  git checkout develop
  git pull origin develop
  ```

### 🟡 feature/*
- **Purpose**: New features, improvements
- **Naming**: `feature/short-description`
- **Base branch**: develop
- **Lifespan**: Temporary (delete after merge)
- **Workflow**:
  ```bash
  # Create feature branch
  git checkout develop
  git pull origin develop
  git checkout -b feature/dark-mode-toggle

  # Work and commit
  git add .
  git commit -m "Add dark mode toggle to settings"

  # Push to remote
  git push -u origin feature/dark-mode-toggle

  # Create Pull Request on GitHub
  # After approval:
  git checkout develop
  git pull origin develop
  git merge --no-ff feature/dark-mode-toggle
  git push origin develop

  # Delete feature branch
  git branch -d feature/dark-mode-toggle
  git push origin --delete feature/dark-mode-toggle
  ```

### 🟠 release/*
- **Purpose**: Prepare next release
- **Naming**: `release/v*.*.* (semver)`
- **Base branch**: develop
- **Lifespan**: Until merged to main AND develop
- **When to create**: When develop is ready for release
- **Workflow**:
  ```bash
  # Create release branch
  git checkout develop
  git pull origin develop
  git checkout -b release/v1.0.0

  # Update version numbers, fix bugs only
  # DO NOT add new features
  npm version major  # or minor/patch

  # Merge to main
  git checkout main
  git pull origin main
  git merge --no-ff release/v1.0.0
  git tag v1.0.0
  git push origin main --tags

  # Merge back to develop
  git checkout develop
  git merge --no-ff release/v1.0.0
  git push origin develop

  # Delete release branch
  git branch -d release/v1.0.0
  git push origin --delete release/v1.0.0
  ```

### 🔴 hotfix/*
- **Purpose**: Critical fixes for production
- **Naming**: `hotfix/bug-description`
- **Base branch**: main
- **Workflow**:
  ```bash
  # Create hotfix from main
  git checkout main
  git pull origin main
  git checkout -b hotfix/audio-context-crash

  # Fix and test
  git add .
  git commit -m "Fix audio context crash on mobile"

  # Merge to main
  git checkout main
  git merge --no-ff hotfix/audio-context-crash
  git tag v1.0.1
  git push origin main --tags

  # Merge to develop
  git checkout develop
  git merge --no-ff hotfix/audio-context-crash
  git push origin develop

  # Delete hotfix branch
  git branch -d hotfix/audio-context-crash
  git push origin --delete hotfix/audio-context-crash
  ```

## Commit Message Convention

Follow semantic commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature (feature/*)
- **fix**: Bug fix (hotfix/*)
- **refactor**: Code refactor
- **test**: Add/update tests
- **docs**: Documentation changes
- **style**: Code style (formatting, missing semicolons, etc)
- **chore**: Build, dependencies, tools

### Examples

```bash
# Feature
git commit -m "feat(audio): add volume slider UI controls"

# Bug fix
git commit -m "fix(gamestate): prevent invalid state transitions"

# Refactor
git commit -m "refactor(core): extract hand calculation to utility"

# Test
git commit -m "test(deck): add shuffle randomness tests"

# Docs
git commit -m "docs(api): update EventBus listener examples"
```

## Current Status

```
Branches:
  develop               ← WORK HERE for features
  feature/initial-setup ← Template for new features
  release/v1.0.0       ← Template for releases
  hotfix/critical-fixes ← Template for hotfixes
  main                  ← Production (protected)

Latest commit: 4ad06dc Initial commit
```

## Typical Week Workflow

```
Monday:
  1. Create feature/user-authentication from develop
  2. Work and push commits
  3. Create Pull Request

Wednesday:
  4. Code review and approval
  5. Merge to develop
  6. Delete feature branch

Friday:
  7. Create release/v1.1.0 from develop
  8. Fix version numbers, test
  9. Merge to main with tag
  10. Merge back to develop

(Any time - URGENT):
  - Create hotfix/critical-bug from main
  - Fix and merge to both main & develop
```

## Tips & Tricks

### Merge without merging own code
```bash
# Include merge commit even if fastforward possible
git merge --no-ff <branch>
```

### See what's in a branch
```bash
# Compare feature to develop
git log develop..<branch>
git diff develop..<branch>
```

### Sync branch with latest develop
```bash
git checkout feature/my-feature
git fetch origin
git rebase origin/develop
git push --force-with-lease origin feature/my-feature
```

### Abort a merge
```bash
git merge --abort
```

### Delete local & remote branch
```bash
git branch -d feature/old-feature
git push origin --delete feature/old-feature
```

## Protection Rules (GitHub)

Recommended protection rules for main branch:

- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks (tests must pass)
- ✅ Require branches to be up to date
- ✅ Require code reviews before merging
- ✅ Require signed commits
- ✅ Resolve conversations before merging

## Next Steps

1. **Install git hooks** (optional):
   ```bash
   npm install husky --save-dev
   npx husky install
   ```

2. **Start developing**:
   ```bash
   git checkout develop
   git checkout -b feature/my-feature
   ```

3. **Push to GitHub** and create Pull Request

---

**Questions?** See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details.
