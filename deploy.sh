#!/bin/bash
# =============================================================================
# Deploiement Admin Societe -> GitHub -> Vercel (auto-deploy)
# Usage : ./deploy.sh "message du commit"
# =============================================================================
set -e

cd "$(dirname "$0")"

echo ""
echo "=============================================="
echo "  Deploiement Admin Societe"
echo "=============================================="
echo ""

# Etape 1: commit automatique des changements
git add -A
if git diff --cached --quiet; then
  echo "Aucune modification detectee."
else
  MSG="${1:-chore: deploiement admin_societe $(date '+%Y-%m-%d %H:%M')}"
  git commit -m "$MSG"
  echo "Commit cree: $MSG"
fi

# Etape 2: push (Render/Vercel auto-deploy via GitHub)
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "Push vers origin/$CURRENT_BRANCH ..."
git push origin "$CURRENT_BRANCH"

# Etape 3: deploiement Vercel force (plus rapide et explicite)
if command -v vercel >/dev/null 2>&1; then
  echo "Deploiement Vercel en production..."
  vercel --prod --yes --archive=tgz
else
  echo "CLI Vercel non detectee."
  echo "Le deploiement passera uniquement par l'auto-deploy GitHub."
fi

echo ""
echo "Termine: admin_societe est deployee."
