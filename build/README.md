# Build Assets

Ce dossier contient les assets pour le packaging Electron.

## Icônes requises

Pour un packaging complet, vous devez fournir les icônes suivantes :

### Windows
- `icon.ico` (256x256 ou multi-résolution)
  - Peut être généré depuis un PNG avec des outils comme ImageMagick :
    ```bash
    convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
    ```

### macOS
- `icon.icns` (multi-résolution)
  - Peut être généré avec `iconutil` :
    ```bash
    mkdir icon.iconset
    sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
    sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
    sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
    sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
    sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
    sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
    sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
    sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
    sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
    sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
    iconutil -c icns icon.iconset
    ```

### Linux
- `icon.png` (512x512 recommandé)

## Créer les icônes

Si vous avez un PNG source (512x512 ou plus), vous pouvez utiliser des outils en ligne :

- https://icon.kitchen/ (génère toutes les tailles)
- https://www.icoconverter.com/ (ICO)
- https://iconverticons.com/online/ (ICNS)

## Temporaire

Pour l'instant, vous pouvez placer un PNG simple nommé `icon.png` dans ce dossier.
electron-builder utilisera ce PNG par défaut pour toutes les plateformes.

## Design recommandé

Le logo du jeu devrait inclure :
- Un ou plusieurs disques (cercles)
- Des points rouges et verts
- Couleurs : #6366f1 (bleu), #ef4444 (rouge), #10b981 (vert)
- Fond simple ou transparent
