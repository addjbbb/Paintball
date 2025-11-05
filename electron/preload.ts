/**
 * Script Preload Electron
 * Expose des API sécurisées au renderer process
 */

import { contextBridge } from 'electron';

/**
 * Expose des API sécurisées au contexte de la page web
 * Accessible via window.electron dans le renderer
 */
contextBridge.exposeInMainWorld('electron', {
  /**
   * Informations sur la plateforme
   */
  platform: process.platform,

  /**
   * Version de l'application
   */
  version: process.env.npm_package_version || '1.0.0',

  /**
   * Environnement
   */
  isDevelopment: process.env.NODE_ENV === 'development'
});

// Note: Pour l'instant, pas besoin d'API IPC complexes
// L'application utilise uniquement localStorage pour la persistance
// Si besoin d'accès fichiers dans le futur, ajouter ici les handlers IPC
