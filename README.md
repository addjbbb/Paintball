# Paintball Puzzle - Jeu de Réflexion

**Projet de mémoire de Licence (L3)**

Application de jeu de réflexion où le joueur doit placer des disques pour couvrir tous les points rouges sans toucher aucun point vert. Les niveaux sont générés procéduralement via une méthode inversée qui garantit qu'ils sont toujours solvables.

![Paintball Puzzle](docs/screenshot.png)

## 📋 Table des matières

- [Concept du jeu](#concept-du-jeu)
- [Caractéristiques](#caractéristiques)
- [Technologies utilisées](#technologies-utilisées)
- [Installation et lancement](#installation-et-lancement)
- [Génération procédurale](#génération-procédurale)
- [Architecture du code](#architecture-du-code)
- [Tests](#tests)
- [Packaging et distribution](#packaging-et-distribution)
- [Limites et améliorations](#limites-et-améliorations)

## 🎮 Concept du jeu

### Règles

1. **Objectif** : Couvrir tous les points rouges avec des disques sans toucher les points verts
2. **Contraintes** : Nombre limité de disques par niveau
3. **Victoire** : Tous les rouges couverts ET aucun vert touché
4. **Défaite** : Disques épuisés avec des rouges non couverts OU un vert touché

### Gameplay

- **Placement** : Cliquez sur le Canvas pour placer un disque
- **Aperçu** : Un halo circulaire montre la zone avant placement
- **Feedback visuel** :
  - Halo rouge si un vert serait touché
  - Animation élastique au placement
  - Effet de ripple/onde
- **Annulation** : Bouton "Annuler" pour retirer le dernier disque
- **Recommencer** : Icône en haut à gauche pour rejouer le même niveau (même seed)

### Progression

- **50 niveaux** organisés en 4 paliers de difficulté :
  - Niveaux 1-10 : Facile
  - Niveaux 11-25 : Débutant
  - Niveaux 26-40 : Intermédiaire
  - Niveaux 41-50 : Difficile

- **Sélecteur serpentin** avec cadenas :
  - Déblocage progressif (niveau N+1 débloqué en complétant N)
  - Filtre par difficulté
  - Affichage des meilleurs temps

## ✨ Caractéristiques

### Interface utilisateur

- **Design moderne et responsive** avec animations fluides
- **Écran d'accueil** : Saisie de pseudo, profils sauvegardés
- **Sélecteur de niveaux** : Grille serpentine avec cadenas visuels
- **HUD en jeu** :
  - Disques restants
  - Visites restantes (synonyme de disques restants)
  - Chronomètre
  - Seed du niveau
- **Modals** :
  - Victoire avec animation de confettis
  - Défaite avec explication de la cause

### Fonctionnalités techniques

- **Persistance localStorage** :
  - Profils utilisateurs multiples
  - Progression par niveau
  - Statistiques (tentatives, victoires, meilleurs temps)
  - Seeds utilisées

- **Reproductibilité** :
  - Seed unique par niveau
  - Bouton "Recommencer" génère exactement le même niveau
  - Affichage de la seed pour partage/debug

- **Tests unitaires** avec Vitest :
  - Génération avec seed (reproductibilité)
  - Validation victoire/défaite
  - Géométrie et collisions

## 🛠 Technologies utilisées

- **Frontend** : React 18 + TypeScript
- **Build** : Vite
- **Rendu** : Canvas API pour les interactions graphiques
- **Desktop** : Electron (packaging en exécutable)
- **Tests** : Vitest
- **Styles** : CSS moderne avec variables CSS
- **Packaging** : electron-builder

## 🚀 Installation et lancement

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation depuis les sources

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd Paintball
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer en mode développement**
   ```bash
   npm run dev
   ```
   Le jeu s'ouvrira dans votre navigateur à `http://localhost:5173`

### Lancement en 1 clic (depuis sources)

#### Windows
Double-cliquez sur `scripts/LaunchGame.bat`

Le script va :
- Vérifier Node.js et npm
- Installer les dépendances si nécessaire
- Lancer le jeu automatiquement

#### macOS / Linux
```bash
chmod +x scripts/launch.sh
./scripts/launch.sh
```

### Commandes disponibles

```bash
npm run dev           # Développement (navigateur)
npm run build         # Build production
npm run preview       # Prévisualiser le build
npm run test          # Lancer les tests
npm run test:watch    # Tests en mode watch
npm run electron:dev  # Lancer avec Electron (dev)
npm run dist          # Créer l'exécutable (toutes plateformes)
npm run dist:win      # Créer l'EXE Windows
npm run dist:mac      # Créer le DMG macOS
npm run dist:linux    # Créer l'AppImage Linux
```

## 🧮 Génération procédurale

### Méthode inversée

L'algorithme de génération garantit que chaque niveau est **solvable par construction** :

#### Étapes de l'algorithme

1. **Placement de K disques fantômes**
   - Choix aléatoire de K centres avec contrainte de distance minimale
   - K = nombre de disques que le joueur devra placer
   - Ces disques forment une solution valide

2. **Génération des points rouges**
   - Échantillonnage uniforme à l'intérieur de l'union des disques fantômes
   - Distribution par densité contrôlée
   - Garantit que tous les rouges sont couverts par les K disques

3. **Génération des points verts**
   - Échantillonnage à l'extérieur de tous les disques fantômes
   - Marge de sécurité (`safetyMargin`) pour éviter placements trop proches
   - Garantit qu'aucun vert n'est touché par la solution

4. **Suppression des disques fantômes**
   - Seuls les points (rouges et verts) restent visibles
   - Le joueur doit retrouver les K positions optimales

#### Paramètres par difficulté

| Difficulté | Rayon | Disques | Rouges | Verts | Marge |
|------------|-------|---------|--------|-------|-------|
| Facile     | 80    | 3       | 15     | 8     | 20    |
| Débutant   | 70    | 4       | 20     | 12    | 15    |
| Intermédiaire | 60 | 5    | 25     | 18    | 10    |
| Difficile  | 50    | 6       | 30     | 25    | 5     |

### Complexité algorithmique

- **Génération de K disques** : O(K²) dans le pire cas (rejets multiples pour contrainte de distance)
- **Génération de points rouges** : O(N_red × K) avec N_red points
- **Génération de points verts** : O(N_green × K) avec N_green points
- **Total** : **O(K² + K × (N_red + N_green))**

Pour K = 6, N_red = 30, N_green = 25 : ~360 opérations → Génération instantanée

### Reproductibilité par seed

- Chaque niveau utilise un générateur pseudo-aléatoire (PRNG) avec seed
- Algorithme **Mulberry32** pour rapidité et qualité
- Format de seed : `level_{numéro}_{timestamp ou constante}`
- Même seed → niveau identique pixel par pixel

## 📁 Architecture du code

```
Paintball/
├── src/
│   ├── core/                  # Cœur algorithmique
│   │   ├── levelGenerator.ts  # Génération inversée
│   │   └── gameValidator.ts   # Validation victoire/défaite
│   ├── levels/                # Configuration des niveaux
│   │   └── config.ts          # Paramètres par difficulté
│   ├── types/                 # Types TypeScript
│   │   └── index.ts           # Point, Disc, Level, etc.
│   ├── ui/                    # Composants React
│   │   ├── Welcome.tsx        # Écran d'accueil
│   │   ├── LevelSelector.tsx  # Sélecteur serpentin
│   │   ├── GameScreen.tsx     # Écran de jeu principal
│   │   └── GameCanvas.tsx     # Rendu Canvas
│   ├── utils/                 # Utilitaires
│   │   ├── random.ts          # PRNG avec seed
│   │   ├── geometry.ts        # Fonctions géométriques
│   │   └── storage.ts         # localStorage
│   ├── App.tsx                # Composant racine
│   ├── main.tsx               # Point d'entrée React
│   └── index.css              # Styles globaux
├── electron/
│   ├── main.ts                # Processus principal Electron
│   └── preload.ts             # Script preload
├── tests/                     # Tests unitaires
│   ├── random.test.ts
│   ├── levelGenerator.test.ts
│   └── gameValidator.test.ts
├── scripts/
│   ├── LaunchGame.bat         # Launcher Windows
│   └── launch.sh              # Launcher Unix
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── README.md
```

### Modules clés

- **`src/core/levelGenerator.ts`** : Algorithme de génération inversée
- **`src/core/gameValidator.ts`** : Détection victoire/défaite, validation en temps réel
- **`src/utils/random.ts`** : PRNG Mulberry32 pour reproductibilité
- **`src/utils/geometry.ts`** : Collisions, distances, index spatial
- **`src/utils/storage.ts`** : Gestion localStorage (profils, progression)

## 🧪 Tests

### Lancer les tests

```bash
npm run test        # Une fois
npm run test:watch  # Mode watch
```

### Couverture des tests

- **random.test.ts** : Reproductibilité du PRNG, seed parsing
- **levelGenerator.test.ts** : Génération inversée, solvabilité, respect des paramètres
- **gameValidator.test.ts** : Détection victoire/défaite, collisions, cas limites

### Exemples de tests critiques

1. **Reproductibilité** : Même seed → niveaux identiques
2. **Solvabilité** : Tous les niveaux générés sont valides
3. **Validation** : Détection correcte des conditions de victoire/défaite
4. **Géométrie** : Collisions point-disque, bords, overlaps

## 📦 Packaging et distribution

### Créer l'exécutable

#### Windows (NSIS Installer)
```bash
npm run dist:win
```
Génère `release/Paintball-Puzzle-Setup-1.0.0.exe`

- Installateur one-click
- Raccourcis Desktop + Menu Démarrer
- Désinstallation propre

#### macOS (DMG)
```bash
npm run dist:mac
```
Génère `release/Paintball-Puzzle-1.0.0.dmg`

- App bundle signée (si certificat)
- Glisser-déposer dans Applications

#### Linux (AppImage)
```bash
npm run dist:linux
```
Génère `release/Paintball-Puzzle-1.0.0.AppImage`

- Portable, aucune installation
- Chmod +x et lancer

### Configuration electron-builder

Voir `package.json` > section `build` :
- Icônes par plateforme (`.ico`, `.icns`, `.png`)
- NSIS one-click
- Fichiers inclus : `dist/`, `dist-electron/`
- AppId : `com.paintball.puzzle`

### Distribution

1. **Utilisateur final** : Télécharge `GameSetup.exe` → Installe → Lance
2. **Depuis sources** : Double-clic sur `LaunchGame.bat` ou `launch.sh`

## 🔬 Limites et pistes d'amélioration

### Limites actuelles

1. **Algorithme de génération** :
   - Rejets possibles si contraintes trop strictes (rare avec paramètres actuels)
   - Pas d'optimisation pour garantir difficulté *perçue* identique entre niveaux d'un même palier

2. **Interface** :
   - Pas de support tactile optimisé (mobile)
   - Animations Canvas basiques (pas de bibliothèque dédiée comme PixiJS)

3. **Fonctionnalités** :
   - Pas de mode multijoueur local (tour par tour)
   - Pas d'éditeur de niveaux personnalisés
   - Pas de leaderboard en ligne

4. **Accessibilité** :
   - Pas de support clavier complet pour le placement
   - Daltonisme : pourrait bénéficier de formes en plus des couleurs

### Améliorations futures

1. **Algorithmes** :
   - Ajouter des heuristiques de difficulté (compacité, dispersion)
   - Générer plusieurs niveaux par seed et choisir le meilleur selon métriques

2. **Gameplay** :
   - Mode "indice" montrant un disque fantôme
   - Mode chronométré
   - Achievements/trophées

3. **Technique** :
   - Passer au WebGL pour plus de performances (milliers de points)
   - Sauvegarder les replays (liste des actions)
   - Export/import de progression (cloud sync)

4. **UI/UX** :
   - Tutoriel interactif
   - Animations plus riches (particules, transitions)
   - Mode sombre

5. **Distribution** :
   - Auto-update via electron-updater
   - Publication sur Steam, itch.io, ou stores

## 👨‍💻 Développement

### Structure des commits

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `refactor:` Refactoring sans changement de comportement
- `test:` Ajout/modification de tests
- `docs:` Documentation

### Workflow

1. Créer une branche : `git checkout -b feat/ma-fonctionnalite`
2. Développer et tester : `npm run test`
3. Commit : `git commit -m "feat: ajout de X"`
4. Push et PR

## 📄 Licence

MIT License - Voir fichier `LICENSE`

## 🙏 Remerciements

- **Inspiration** : Jeux de type Planarity et couverture de points
- **Algorithme** : Méthode de génération inversée pour garantir solvabilité
- **Bibliothèques** : React, Electron, Vite, Vitest

---

**Projet réalisé dans le cadre d'un mémoire de Licence (L3)**

Pour toute question : [contact]

## 🚦 Quick Start

### Lancer le jeu immédiatement

1. **Installer Node.js** : https://nodejs.org/
2. **Cloner ce repo** et ouvrir un terminal
3. **Lancer** :
   ```bash
   npm install && npm run dev
   ```
4. **Jouer** dans votre navigateur !

### Créer l'exécutable Windows

```bash
npm install
npm run dist:win
```

L'installateur sera dans `release/`

---

**Bon jeu ! 🎮**
