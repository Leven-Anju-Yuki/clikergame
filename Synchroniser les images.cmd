@echo off
cd /d "%~dp0"
node tools/update-images.mjs --backup-local
pause
