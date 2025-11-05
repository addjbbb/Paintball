@echo off
REM ========================================
REM Launcher automatique - Paintball Puzzle
REM Windows Batch Script
REM ========================================

echo ========================================
echo Paintball Puzzle - Launcher
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé ou n'est pas dans le PATH.
    echo.
    echo Veuillez installer Node.js depuis: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Vérifier si npm est installé
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] npm n'est pas installé.
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js et npm détectés.
node --version
npm --version
echo.

REM Vérifier si node_modules existe
if not exist "node_modules\" (
    echo [INFO] Dépendances manquantes. Installation en cours...
    echo.
    call npm ci
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERREUR] L'installation des dépendances a échoué.
        echo Essayez de lancer manuellement: npm install
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCÈS] Dépendances installées avec succès.
    echo.
) else (
    echo [INFO] Dépendances déjà installées.
    echo.
)

REM Vérifier si on est en mode développement (dossier src existe)
if exist "src\" (
    echo [INFO] Lancement en mode développement...
    echo.
    call npm run electron:dev
) else if exist "dist\" (
    echo [INFO] Lancement en mode production...
    echo.
    call npm run preview
) else (
    echo [ERREUR] Ni le dossier src ni le dossier dist n'existent.
    echo Veuillez builder le projet d'abord: npm run build
    echo.
    pause
    exit /b 1
)

pause
