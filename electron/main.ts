/**
 * Processus principal Electron
 * Gère la fenêtre et les événements système
 */

import { app, BrowserWindow } from 'electron';
import * as path from 'path';

// Désactiver l'accélération matérielle si nécessaire
// app.disableHardwareAcceleration();

let mainWindow: BrowserWindow | null = null;

// Variables d'environnement
const isDevelopment = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

/**
 * Crée la fenêtre principale de l'application
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    title: 'Paintball Puzzle',
    backgroundColor: '#f9fafb',
    show: false // Ne montrer qu'une fois prêt
  });

  // Afficher quand prêt pour éviter le flash blanc
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Charger l'application
  if (isDevelopment && VITE_DEV_SERVER_URL) {
    // Mode développement: charger depuis le serveur Vite
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // Ouvrir DevTools en dev
    mainWindow.webContents.openDevTools();
  } else {
    // Mode production: charger depuis les fichiers buildés
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Événement: l'application est prête
 */
app.whenReady().then(() => {
  createWindow();

  // Sur macOS, recréer la fenêtre si l'app est activée sans fenêtre
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Événement: toutes les fenêtres sont fermées
 */
app.on('window-all-closed', () => {
  // Sur macOS, les apps restent actives jusqu'à Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Événement: l'app va quitter
 */
app.on('will-quit', () => {
  // Nettoyage si nécessaire
});

/**
 * Sécurité: empêcher la navigation vers des URLs externes
 */
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Autoriser uniquement localhost en dev
    if (isDevelopment && parsedUrl.origin === 'http://localhost:5173') {
      return;
    }

    // Bloquer toutes les autres navigations
    event.preventDefault();
  });

  // Bloquer l'ouverture de nouvelles fenêtres
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});
