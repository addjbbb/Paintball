/**
 * Gestionnaire de persistance localStorage
 * Gère le profil utilisateur, la progression et les statistiques
 */

import { UserProfile, LevelStats } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'paintball_current_user',
  PROFILES: 'paintball_profiles'
} as const;

/**
 * Récupère le profil utilisateur actuel
 */
export function getCurrentUser(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Définit l'utilisateur actuel
 */
export function setCurrentUser(username: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
}

/**
 * Récupère tous les profils stockés
 */
function getAllProfiles(): Record<string, UserProfile> {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Sauvegarde tous les profils
 */
function saveAllProfiles(profiles: Record<string, UserProfile>): void {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}

/**
 * Récupère le profil d'un utilisateur
 * Crée un nouveau profil s'il n'existe pas
 */
export function getUserProfile(username: string): UserProfile {
  const profiles = getAllProfiles();

  if (profiles[username]) {
    return profiles[username];
  }

  // Créer un nouveau profil
  const newProfile: UserProfile = {
    username,
    createdAt: new Date().toISOString(),
    completedLevels: [],
    levelStats: {},
    levelSeeds: {}
  };

  profiles[username] = newProfile;
  saveAllProfiles(profiles);

  return newProfile;
}

/**
 * Sauvegarde le profil d'un utilisateur
 */
export function saveUserProfile(profile: UserProfile): void {
  const profiles = getAllProfiles();
  profiles[profile.username] = profile;
  saveAllProfiles(profiles);
}

/**
 * Marque un niveau comme complété
 */
export function markLevelCompleted(username: string, levelNumber: number): void {
  const profile = getUserProfile(username);

  if (!profile.completedLevels.includes(levelNumber)) {
    profile.completedLevels.push(levelNumber);
    profile.completedLevels.sort((a, b) => a - b);
  }

  saveUserProfile(profile);
}

/**
 * Vérifie si un niveau est complété
 */
export function isLevelCompleted(username: string, levelNumber: number): boolean {
  const profile = getUserProfile(username);
  return profile.completedLevels.includes(levelNumber);
}

/**
 * Retourne le dernier niveau débloqué
 */
export function getLastUnlockedLevel(username: string): number {
  const profile = getUserProfile(username);

  if (profile.completedLevels.length === 0) {
    return 1; // Premier niveau toujours débloqué
  }

  // Le dernier niveau complété + 1
  const maxCompleted = Math.max(...profile.completedLevels);
  return maxCompleted + 1;
}

/**
 * Retourne tous les niveaux débloqués
 */
export function getUnlockedLevels(username: string): number[] {
  const profile = getUserProfile(username);
  const unlocked: number[] = [1]; // Niveau 1 toujours débloqué

  // Débloquer tous les niveaux jusqu'au dernier complété + 1
  if (profile.completedLevels.length > 0) {
    const maxCompleted = Math.max(...profile.completedLevels);
    for (let i = 2; i <= maxCompleted + 1; i++) {
      unlocked.push(i);
    }
  }

  return unlocked;
}

/**
 * Enregistre une tentative sur un niveau
 */
export function recordLevelAttempt(
  username: string,
  levelNumber: number,
  won: boolean,
  timeSeconds?: number
): void {
  const profile = getUserProfile(username);

  // Initialiser les stats si nécessaire
  if (!profile.levelStats[levelNumber]) {
    profile.levelStats[levelNumber] = {
      attempts: 0,
      wins: 0
    };
  }

  const stats = profile.levelStats[levelNumber];
  stats.attempts++;

  if (won) {
    stats.wins++;

    // Mettre à jour le meilleur temps
    if (timeSeconds !== undefined) {
      if (!stats.bestTime || timeSeconds < stats.bestTime) {
        stats.bestTime = timeSeconds;
      }
    }
  }

  stats.lastAttempt = new Date().toISOString();

  saveUserProfile(profile);
}

/**
 * Récupère les statistiques d'un niveau
 */
export function getLevelStats(
  username: string,
  levelNumber: number
): LevelStats | undefined {
  const profile = getUserProfile(username);
  return profile.levelStats[levelNumber];
}

/**
 * Enregistre la seed utilisée pour un niveau
 */
export function saveLevelSeed(
  username: string,
  levelNumber: number,
  seed: string
): void {
  const profile = getUserProfile(username);
  profile.levelSeeds[levelNumber] = seed;
  saveUserProfile(profile);
}

/**
 * Récupère la seed d'un niveau
 */
export function getLevelSeed(
  username: string,
  levelNumber: number
): string | undefined {
  const profile = getUserProfile(username);
  return profile.levelSeeds[levelNumber];
}

/**
 * Exporte la progression d'un utilisateur en JSON
 */
export function exportProgress(username: string): string {
  const profile = getUserProfile(username);
  return JSON.stringify(profile, null, 2);
}

/**
 * Importe la progression d'un utilisateur depuis JSON
 */
export function importProgress(jsonData: string): boolean {
  try {
    const profile: UserProfile = JSON.parse(jsonData);

    // Validation basique
    if (!profile.username || !Array.isArray(profile.completedLevels)) {
      return false;
    }

    saveUserProfile(profile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Réinitialise complètement un profil
 */
export function resetProfile(username: string): void {
  const profiles = getAllProfiles();
  delete profiles[username];
  saveAllProfiles(profiles);
}

/**
 * Liste tous les utilisateurs
 */
export function getAllUsers(): string[] {
  const profiles = getAllProfiles();
  return Object.keys(profiles);
}
