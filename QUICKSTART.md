# Guide de démarrage rapide

## Installation

```bash
npm install
```

## Lancement en développement

```bash
npm run dev
```

Ouvre le navigateur sur http://localhost:5173

## Lancer avec Electron (mode bureau)

```bash
npm run electron:dev
```

## Tests

```bash
npm run test
```

## Build de production

```bash
npm run build
```

## Créer l'exécutable

### Windows
```bash
npm run dist:win
```
→ Génère `release/Paintball-Puzzle-Setup-1.0.0.exe`

### macOS
```bash
npm run dist:mac
```
→ Génère `release/Paintball-Puzzle-1.0.0.dmg`

### Linux
```bash
npm run dist:linux
```
→ Génère `release/Paintball-Puzzle-1.0.0.AppImage`

## Structure importante

- `src/core/` - Algorithmes (génération, validation)
- `src/ui/` - Composants React
- `src/levels/config.ts` - Configuration des niveaux
- `electron/` - Code Electron
- `tests/` - Tests unitaires

## Modifier la seed d'un niveau

Éditez `src/levels/config.ts` → fonction `getDefaultLevelSeed()`

## Changer les paramètres de difficulté

Éditez `src/levels/config.ts` → constante `DIFFICULTY_CONFIGS`

## Problèmes courants

### Erreur au build Electron
- Vérifiez que `dist/` existe : `npm run build` d'abord
- Supprimez `node_modules` et réinstallez

### Tests qui échouent
- Vérifiez la reproductibilité : les seeds doivent générer les mêmes niveaux
- Logs détaillés : `npm run test -- --reporter=verbose`

### Icônes manquantes
- Ajoutez `build/icon.png` (512x512)
- Ou générez depuis `public/favicon.svg`

## Ressources

- Documentation complète : `README.md`
- Tests : `npm run test`
- Logs Electron : Ouvrir DevTools (Ctrl+Shift+I en dev)
