/**
 * Configuration des niveaux par difficulté
 * Définit les paramètres de génération procédurale pour chaque niveau
 */

import { Difficulty, LevelParams } from '../types';

/**
 * Configuration de base par difficulté
 */
export const DIFFICULTY_CONFIGS: Record<Difficulty, Partial<LevelParams>> = {
  facile: {
    discRadius: 80,
    numDiscs: 3,
    numRedPoints: 15,
    numGreenPoints: 8,
    safetyMargin: 20,
    minDiscDistance: 100,
    difficulty: 'facile'
  },
  debutant: {
    discRadius: 70,
    numDiscs: 4,
    numRedPoints: 20,
    numGreenPoints: 12,
    safetyMargin: 15,
    minDiscDistance: 80,
    difficulty: 'debutant'
  },
  intermediaire: {
    discRadius: 60,
    numDiscs: 5,
    numRedPoints: 25,
    numGreenPoints: 18,
    safetyMargin: 10,
    minDiscDistance: 60,
    difficulty: 'intermediaire'
  },
  difficile: {
    discRadius: 50,
    numDiscs: 6,
    numRedPoints: 30,
    numGreenPoints: 25,
    safetyMargin: 5,
    minDiscDistance: 50,
    difficulty: 'difficile'
  }
};

/**
 * Distribution des 50 niveaux par difficulté
 * Progression graduelle avec pics de difficulté
 */
export const LEVEL_DIFFICULTY_MAP: Record<number, Difficulty> = {
  // Niveaux 1-10: Facile
  1: 'facile',
  2: 'facile',
  3: 'facile',
  4: 'facile',
  5: 'facile',
  6: 'facile',
  7: 'facile',
  8: 'facile',
  9: 'facile',
  10: 'facile',

  // Niveaux 11-25: Débutant
  11: 'debutant',
  12: 'debutant',
  13: 'debutant',
  14: 'debutant',
  15: 'debutant',
  16: 'debutant',
  17: 'debutant',
  18: 'debutant',
  19: 'debutant',
  20: 'debutant',
  21: 'debutant',
  22: 'debutant',
  23: 'debutant',
  24: 'debutant',
  25: 'debutant',

  // Niveaux 26-40: Intermédiaire
  26: 'intermediaire',
  27: 'intermediaire',
  28: 'intermediaire',
  29: 'intermediaire',
  30: 'intermediaire',
  31: 'intermediaire',
  32: 'intermediaire',
  33: 'intermediaire',
  34: 'intermediaire',
  35: 'intermediaire',
  36: 'intermediaire',
  37: 'intermediaire',
  38: 'intermediaire',
  39: 'intermediaire',
  40: 'intermediaire',

  // Niveaux 41-50: Difficile
  41: 'difficile',
  42: 'difficile',
  43: 'difficile',
  44: 'difficile',
  45: 'difficile',
  46: 'difficile',
  47: 'difficile',
  48: 'difficile',
  49: 'difficile',
  50: 'difficile'
};

/**
 * Nombre total de niveaux
 */
export const TOTAL_LEVELS = 50;

/**
 * Dimensions du plateau de jeu (Canvas)
 */
export const BOARD_WIDTH = 800;
export const BOARD_HEIGHT = 600;

/**
 * Retourne les paramètres complets pour un niveau donné
 * @param levelNumber - Numéro du niveau (1-50)
 * @returns Paramètres de génération complets
 */
export function getLevelParams(levelNumber: number): LevelParams {
  const difficulty = LEVEL_DIFFICULTY_MAP[levelNumber] || 'facile';
  const baseConfig = DIFFICULTY_CONFIGS[difficulty];

  // Variation progressive dans chaque palier de difficulté
  const variationFactor = (levelNumber % 10) / 10; // 0 à 0.9

  return {
    discRadius: baseConfig.discRadius!,
    numDiscs: baseConfig.numDiscs!,
    numRedPoints: Math.floor(baseConfig.numRedPoints! * (1 + variationFactor * 0.2)),
    numGreenPoints: Math.floor(baseConfig.numGreenPoints! * (1 + variationFactor * 0.3)),
    safetyMargin: baseConfig.safetyMargin!,
    minDiscDistance: baseConfig.minDiscDistance!,
    difficulty
  };
}

/**
 * Retourne une seed déterministe pour un niveau donné
 * Permet la reproductibilité des niveaux
 */
export function getDefaultLevelSeed(levelNumber: number): string {
  // Seed fixe par niveau pour avoir toujours le même niveau
  return `level_${levelNumber}_fixed_${1000 + levelNumber * 137}`;
}

/**
 * Filtre les niveaux par difficulté
 */
export function filterLevelsByDifficulty(difficulty: Difficulty): number[] {
  return Object.entries(LEVEL_DIFFICULTY_MAP)
    .filter(([_, diff]) => diff === difficulty)
    .map(([level, _]) => parseInt(level, 10));
}

/**
 * Retourne la difficulté d'un niveau
 */
export function getLevelDifficulty(levelNumber: number): Difficulty {
  return LEVEL_DIFFICULTY_MAP[levelNumber] || 'facile';
}
