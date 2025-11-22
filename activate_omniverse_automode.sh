#!/usr/bin/env bash
set -e
echo "Starting Omniverse AutoMode activation..."

# 1) Ensure we are on main
git checkout main || git checkout -b main

# 2) Create folders if missing (safe)
mkdir -p tools/templates frontend/assets/generated backend/ai_engine/data frontend/assets

# 3) (Optional) create placeholder photos so generation doesn't fail
for i in 1 2 3; do
  if [ ! -f frontend/assets/photo${i}.jpg ]; then
    printf "" > frontend/assets/photo${i}.jpg
  fi
done

# 4) Add all prepared files (be careful: this will stage all changes)
git add .

# 5) Commit (message includes timestamp)
git commit -m "chore(omniverse): activate automode - assets & ai scaffolds $(date -u +"%Y%m%dT%H%M%SZ")" || echo "No changes to commit"

# 6) Push to origin (will trigger Actions)
git push origin main

echo "Pushed to main — GitHub Actions should start. Monitor Actions tab."
echo "Check: https://github.com/$(git config --get remote.origin.url | sed -e 's/.*://')/actions"
