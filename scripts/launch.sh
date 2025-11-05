#!/bin/bash
# ========================================
# Launcher automatique - Paintball Puzzle
# Unix/Linux/macOS Shell Script
# ========================================

echo "========================================"
echo "Paintball Puzzle - Launcher"
echo "========================================"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installé."
    echo ""
    echo "Veuillez installer Node.js depuis: https://nodejs.org/"
    echo ""
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "[ERREUR] npm n'est pas installé."
    echo ""
    exit 1
fi

echo "[INFO] Node.js et npm détectés."
node --version
npm --version
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "[INFO] Dépendances manquantes. Installation en cours..."
    echo ""
    npm ci
    if [ $? -ne 0 ]; then
        echo ""
        echo "[ERREUR] L'installation des dépendances a échoué."
        echo "Essayez de lancer manuellement: npm install"
        echo ""
        exit 1
    fi
    echo ""
    echo "[SUCCÈS] Dépendances installées avec succès."
    echo ""
else
    echo "[INFO] Dépendances déjà installées."
    echo ""
fi

# Vérifier si on est en mode développement (dossier src existe)
if [ -d "src" ]; then
    echo "[INFO] Lancement en mode développement..."
    echo ""
    npm run electron:dev
elif [ -d "dist" ]; then
    echo "[INFO] Lancement en mode production..."
    echo ""
    npm run preview
else
    echo "[ERREUR] Ni le dossier src ni le dossier dist n'existent."
    echo "Veuillez builder le projet d'abord: npm run build"
    echo ""
    exit 1
fi
