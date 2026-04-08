@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ==============================================
echo   Deploiement Admin Societe
echo ==============================================
echo.

set "MSG=%*"
if "%MSG%"=="" set "MSG=chore: deploiement admin_societe %DATE% %TIME%"

git add -A
git diff --cached --quiet >nul 2>&1
if errorlevel 1 (
  git commit -m "%MSG%"
  echo Commit cree: %MSG%
) else (
  echo Aucune modification detectee.
)

for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%i"
echo Push vers origin/%BRANCH% ...
git push origin %BRANCH%

where vercel >nul 2>&1
if errorlevel 1 (
  echo Vercel CLI non detectee. Auto-deploy GitHub uniquement.
) else (
  echo Deploiement Vercel en production...
  vercel --prod --yes --archive=tgz
)

echo.
echo Termine: admin_societe deploye.
