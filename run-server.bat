@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo  BLACKJACK GAME - LOCAL SERVER LAUNCHER
echo ==========================================
echo.
echo ✓ Porta 8000 nao precisa de permissoes ADMIN
echo ✓ Scripts Python/Node.js nao requerem privilegios
echo.
echo Tentando iniciar servidor local...
echo.

REM Check for Python
python --version > nul 2>&1
if !errorlevel! == 0 (
    echo [✓] Python encontrado! Iniciando servidor...
    echo.
    echo    Acesse: http://localhost:8000
    echo.
    cd /d "%~dp0public"
    python -m http.server 8000
    goto :eof
)

REM Check for Node.js
node --version > nul 2>&1
if !errorlevel! == 0 (
    echo [✓] Node.js encontrado! Iniciando servidor...
    echo.
    echo    Acesse: http://localhost:8000
    echo.
    cd /d "%~dp0"
    npx http-server public -p 8000
    goto :eof
)

REM No server found
echo [✗] Nenhum servidor HTTP disponivel foi encontrado.
echo.
echo SOLUCOES RAPIDAS (sem admin necessario):
echo.
echo 1. Instale Python (mais simples):
echo    Microsoft Store: "Python" ou python.org/downloads
echo.
echo 2. Instale Node.js:
echo    nodejs.org/
echo.
echo COMANDOS MANUAIS (depois de instalar):
echo.
echo Python:
echo   cd public
echo   python -m http.server 8000
echo.
echo Node.js:
echo   npx http-server public -p 8000
echo.
echo ALTERNATIVA VISUAL:
echo   VS Code ^> Instale "Live Server" extension
echo   Clique direito em public/index.html ^> "Open with Live Server"
echo.
pause
