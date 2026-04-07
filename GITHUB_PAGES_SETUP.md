# GitHub Pages Configuration

## 📌 GitHub Pages Setup for Blackjack Game

Your repository is configured for GitHub Pages deployment.

### Current Configuration

**Recommended Setup:**
- **Branch:** `main`
- **Folder:** `/root` (project root)
- **URL:** https://nonato-03.github.io/blackjack-game

### How to Enable

1. Go to your repository: https://github.com/NONATO-03/blackjack-game
2. Click **Settings** (top right)
3. Scroll to **"Pages"** section (left sidebar)
4. Under "Build and deployment":
   - **Source:** Select "Deploy from a branch"
   - **Branch:** Select `main`
   - **Folder:** Select `/ (root)`
5. Click **Save**

### Alternative Options

#### Option A: Deploy from `develop` (Latest features)
- More frequent updates
- May have experimental features
- Steps same as above, just select `develop` instead

#### Option B: Deploy from `gh-pages` branch (Advanced)
```bash
git checkout --orphan gh-pages
git reset --hard
git commit --allow-empty -m "Initial gh-pages"
git push -u origin gh-pages
```
Then select `gh-pages` in Settings.

---

## ✅ Why `main` is Recommended

- ✓ Represents stable, released version (v1.0.0)
- ✓ Protected by PR workflows
- ✓ Clear separation: `main` = production, `develop` = WIP
- ✓ Follows Git Flow best practices

---

## 🎮 Game Features Deployed

- Full Blackjack game with dealer AI
- Event-driven architecture
- Modular UI system
- Audio management
- Game persistence (SaveManager)
- Enterprise-grade code structure

---

## 📊 Deployment Status

```
Repository: https://github.com/NONATO-03/blackjack-game
Branches: main, develop, feature/*, release/*, hotfix/*
Pages URL: https://nonato-03.github.io/blackjack-game
Build: Static HTML/CSS/JS (no build required)
Status: Ready to deploy ✅
```

---

## 🚀 Deployment Flow

```
feature/new-feature
    ↓ (PR)
develop
    ↓ (Release prep)
release/v1.1.0
    ↓ (PR approved)
main ← Deploy to GitHub Pages ✨
    ↓ (tag v1.1.0)
Release published 🎉
```

---

## 💡 Tips

- **Custom domain?** Settings > Pages > Custom domain
- **HTTPS?** Automatic with GitHub Pages
- **Subdirectory?** Use `/docs` folder instead of root
- **Staging?** Deploy `develop` to separate Pages site

---

**Next Step:** Configure Pages in GitHub Settings and your game will be live! 🎰
