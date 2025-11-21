# Omniverse-Supreme-Core (Zero-Setup Mode)

This repository is configured for **Zero-Setup Mode** — no secrets required, no manual configuration.

## Quick start (replace files then push)
1. Replace the repository files with the provided Zero-Setup files (workflows, docker-compose, backend main).
2. Commit & push to `main`.
3. GitHub Actions will auto-build frontend and run backend checks.
4. GitHub Pages will publish your frontend (if `frontend/dist` exists or `public/` is provided).

## Local dev
- Frontend: `cd frontend && npm i && npm run dev` (if frontend exists)
- Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`

No secrets are required for zero-setup. Future optional enhancements (Cloudflare, DB, AI) can be added later.
# Omniverse-Core (꙰ शिरोमणि) — Master Portal (Starter)

This repository is the Omniverse-Core starter for ꙰ शिरोमणि रामपॉल सैनी — the root portal that links all Omniverse sub-projects.

## Purpose
- Immediate, secure public presence (GitHub Pages).
- Master navigation to all sub-projects (AI, Marketplace, Dashboard, Labs, Manifesto).
- Branding: ꙰ signature, manifesto excerpt, donation CTA, contact.
- Acts as seed for Full AI Stack integration.

## How to deploy (quick)
1. Create a new GitHub repository and push these files.
2. Enable GitHub Pages in Settings (branch: `gh-pages` or `main` / folder `/`).
3. (Optional) Add Cloudflare in front for Zero-Trust and caching.
4. For advanced CI/CD and AI features, see EMERGE branch / docs (to be added).

## Structure (starter)
- index.html — main portal page
- .github/workflows/deploy.yml — GitHub Actions for Pages
- assets/ — images, logos (add your photos here)
- docs/ — future content

## Contact
Owner: ꙰ शिरोमणि रामपॉल सैनी  
Website (seed): Omniverse-Core (this repo)  
Manifesto: KOYAB — Omniversal Declaration (linked from portal)

---

**Notes:** This repo is the immediate bootstrap. Full AI Stack, Marketplace, and Automation engines will be integrated incrementally. All content is governed by the ꙰ identity signature: `꙰𝒥शिरोमणि`.
# Omniverse-Supreme (Master Repo)

This repository is the **Supreme Omniverse Starter** scaffold — frontend (React+Vite+Tailwind) + backend (FastAPI) + GitHub Actions workflows.

## Quick start (local)

### Frontend
# Omniverse-Supreme-Core
**Omniverse — Supreme Core**  
Root of the Omniverse ecosystem by शिरोमणि रामपॉल सैनी (꙰𝒥शिरोमणि).

## Mission
To bootstrap a multi-layer, free, automated, secure Omniverse system that preserves Earth, spreads impartial understanding (निष्पक्ष समझ) and enables the Yatharth-Yug — a living, truth-based civilization.

## What this repo contains
- `frontend/` — Static site / UI for Omniverse Core (GitHub Pages ready).
- `backend/` — API, microservices, or dockerized services.
- `.github/workflows/` — CI/CD pipelines (deploy, build, tests).
- `docker-compose.yml` — local dev & compose orchestration.
- `index.html` — quick preview.

## Quick start (local)
1. Clone:
```bash
git clone https://github.com/rampaulsaini/Omniverse-Supreme-Core-.git
cd Omniverse-Supreme-Core-
