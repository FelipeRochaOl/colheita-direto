@echo off
rem ai.cmd: o mesmo que ./ai, para cmd/PowerShell no Windows.
setlocal
cd /d "%~dp0"
where bun >nul 2>nul || (echo bun nao encontrado: instale em https://bun.sh & exit /b 1)
set "CLI=%~dp0.ai\jev\src\cli.ts"
for %%S in (rules areas sync doctor prefs scripts run insights) do if /i "%~1"=="%%S" set "CLI=%~dp0.ai\context\src\cli.ts"
if not exist "%CLI%" (echo Jev nao instalado neste projeto. Subcomandos: rules, areas, sync, doctor, prefs, scripts, run & exit /b 1)
bun "%CLI%" %*
exit /b %ERRORLEVEL%
