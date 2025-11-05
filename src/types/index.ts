/**
 * Types principaux de l'application Paintball Puzzle
 */

/**
 * Point 2D dans le plan du jeu
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Disque circulaire avec position et rayon
 */
export interface Disc {
  center: Point;
  radius: number;
}

/**
 * Point coloré dans le jeu (rouge = à couvrir, vert = à éviter)
 */
export interface ColoredPoint extends Point {
  type: 'red' | 'green';
}

/**
 * Niveau de difficulté
 */
export type Difficulty = 'facile' | 'debutant' | 'intermediaire' | 'difficile';

/**
 * Paramètres de génération pour un niveau
 */
export interface LevelParams {
  /** Rayon des disques à placer */
  discRadius: number;
  /** Nombre de disques fantômes (= nombre de disques à placer) */
  numDiscs: number;
  /** Nombre de points rouges à générer */
  numRedPoints: number;
  /** Nombre de points verts à générer */
  numGreenPoints: number;
  /** Marge de sécurité autour des disques fantômes pour les verts */
  safetyMargin: number;
  /** Distance minimale entre centres de disques fantômes */
  minDiscDistance: number;
  /** Difficulté du niveau */
  difficulty: Difficulty;
}

/**
 * Niveau généré avec tous ses éléments
 */
export interface Level {
  /** Numéro du niveau (1-50) */
  levelNumber: number;
  /** Seed pour reproductibilité */
  seed: string;
  /** Points rouges à couvrir */
  redPoints: Point[];
  /** Points verts à éviter */
  greenPoints: Point[];
  /** Paramètres de génération */
  params: LevelParams;
  /** Dimensions du plateau */
  boardWidth: number;
  boardHeight: number;
}

/**
 * État d'un niveau en cours de jeu
 */
export interface GameState {
  /** Niveau actuel */
  level: Level;
  /** Disques placés par le joueur */
  placedDiscs: Disc[];
  /** Nombre de disques restants à placer */
  remainingDiscs: number;
  /** État du jeu */
  status: 'playing' | 'won' | 'lost';
  /** Message d'erreur en cas de défaite */
  lossReason?: string;
}

/**
 * Profil utilisateur
 */
export interface UserProfile {
  /** Pseudo de l'utilisateur */
  username: string;
  /** Date de création du profil */
  createdAt: string;
  /** Progression (niveaux complétés) */
  completedLevels: number[];
  /** Statistiques par niveau */
  levelStats: Record<number, LevelStats>;
  /** Seeds utilisées par niveau */
  levelSeeds: Record<number, string>;
}

/**
 * Statistiques pour un niveau spécifique
 */
export interface LevelStats {
  /** Meilleur temps en secondes */
  bestTime?: number;
  /** Nombre de tentatives */
  attempts: number;
  /** Victoires */
  wins: number;
  /** Dernière tentative */
  lastAttempt?: string;
}

/**
 * État de sélection de niveau
 */
export interface LevelSelection {
  /** Niveau sélectionné */
  levelNumber: number;
  /** Niveaux débloqués */
  unlockedLevels: number[];
  /** Filtre de difficulté actif */
  difficultyFilter?: Difficulty;
}
