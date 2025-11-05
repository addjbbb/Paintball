/**
 * Validateur de jeu - Vérifie les conditions de victoire et défaite
 *
 * Règles:
 * - Victoire: Tous les points rouges sont couverts ET aucun point vert n'est touché
 * - Défaite: Disques épuisés avec des rouges non couverts OU un point vert touché
 */

import { Point, Disc } from '../types';
import { isPointCoveredByAnyDisc } from '../utils/geometry';
import { SpatialGrid } from '../utils/geometry';

/**
 * Résultat de validation
 */
export interface ValidationResult {
  /** Tous les points rouges sont couverts */
  allRedsCovered: boolean;
  /** Nombre de points rouges couverts */
  redsCovered: number;
  /** Nombre total de points rouges */
  totalReds: number;
  /** Aucun point vert n'est touché */
  noGreensTouched: boolean;
  /** Nombre de points verts touchés */
  greensTouched: number;
  /** Nombre total de points verts */
  totalGreens: number;
  /** Le niveau est gagné */
  isWon: boolean;
  /** Message de résultat */
  message: string;
}

/**
 * Valide l'état actuel du jeu
 * Optimisé avec un index spatial pour performance
 *
 * @param redPoints - Points rouges à couvrir
 * @param greenPoints - Points verts à éviter
 * @param placedDiscs - Disques placés par le joueur
 * @param boardWidth - Largeur du plateau
 * @param boardHeight - Hauteur du plateau
 * @returns Résultat de la validation
 */
export function validateGameState(
  redPoints: Point[],
  greenPoints: Point[],
  placedDiscs: Disc[],
  boardWidth: number,
  boardHeight: number
): ValidationResult {
  // Compter les points rouges couverts
  let redsCovered = 0;
  for (const redPoint of redPoints) {
    if (isPointCoveredByAnyDisc(redPoint, placedDiscs)) {
      redsCovered++;
    }
  }

  const allRedsCovered = redsCovered === redPoints.length;

  // Compter les points verts touchés
  let greensTouched = 0;
  for (const greenPoint of greenPoints) {
    if (isPointCoveredByAnyDisc(greenPoint, placedDiscs)) {
      greensTouched++;
    }
  }

  const noGreensTouched = greensTouched === 0;

  // Déterminer la victoire
  const isWon = allRedsCovered && noGreensTouched;

  // Construire le message
  let message = '';
  if (isWon) {
    message = 'Victoire ! Tous les points rouges sont couverts !';
  } else if (!allRedsCovered && !noGreensTouched) {
    message = `${redPoints.length - redsCovered} rouge(s) non couvert(s) et ${greensTouched} vert(s) touché(s)`;
  } else if (!allRedsCovered) {
    message = `${redPoints.length - redsCovered} point(s) rouge(s) non couvert(s)`;
  } else if (!noGreensTouched) {
    message = `${greensTouched} point(s) vert(s) touché(s)`;
  }

  return {
    allRedsCovered,
    redsCovered,
    totalReds: redPoints.length,
    noGreensTouched,
    greensTouched,
    totalGreens: greenPoints.length,
    isWon,
    message
  };
}

/**
 * Validation optimisée avec index spatial (pour grandes quantités de points)
 * Complexité: O(D * P_cell) au lieu de O(D * P) où:
 * - D = nombre de disques
 * - P = nombre total de points
 * - P_cell = nombre moyen de points par cellule touchée
 */
export function validateGameStateOptimized(
  redPoints: Point[],
  greenPoints: Point[],
  placedDiscs: Disc[],
  boardWidth: number,
  boardHeight: number
): ValidationResult {
  // Pour des petits nombres de points, la version simple est suffisante
  if (redPoints.length + greenPoints.length < 100) {
    return validateGameState(
      redPoints,
      greenPoints,
      placedDiscs,
      boardWidth,
      boardHeight
    );
  }

  // Créer des grilles spatiales pour optimisation
  const redGrid = new SpatialGrid(boardWidth, boardHeight);
  const greenGrid = new SpatialGrid(boardWidth, boardHeight);

  redGrid.addPoints(redPoints);
  greenGrid.addPoints(greenPoints);

  const coveredReds = new Set<Point>();
  const touchedGreens = new Set<Point>();

  // Pour chaque disque, trouver les points proches et vérifier collision
  for (const disc of placedDiscs) {
    const nearbyReds = redGrid.getPointsNearDisc(disc);
    for (const red of nearbyReds) {
      if (isPointCoveredByAnyDisc(red, [disc])) {
        coveredReds.add(red);
      }
    }

    const nearbyGreens = greenGrid.getPointsNearDisc(disc);
    for (const green of nearbyGreens) {
      if (isPointCoveredByAnyDisc(green, [disc])) {
        touchedGreens.add(green);
      }
    }
  }

  const redsCovered = coveredReds.size;
  const greensTouched = touchedGreens.size;

  const allRedsCovered = redsCovered === redPoints.length;
  const noGreensTouched = greensTouched === 0;
  const isWon = allRedsCovered && noGreensTouched;

  let message = '';
  if (isWon) {
    message = 'Victoire ! Tous les points rouges sont couverts !';
  } else if (!allRedsCovered && !noGreensTouched) {
    message = `${redPoints.length - redsCovered} rouge(s) non couvert(s) et ${greensTouched} vert(s) touché(s)`;
  } else if (!allRedsCovered) {
    message = `${redPoints.length - redsCovered} point(s) rouge(s) non couvert(s)`;
  } else if (!noGreensTouched) {
    message = `${greensTouched} point(s) vert(s) touché(s)`;
  }

  return {
    allRedsCovered,
    redsCovered,
    totalReds: redPoints.length,
    noGreensTouched,
    greensTouched,
    totalGreens: greenPoints.length,
    isWon,
    message
  };
}

/**
 * Vérifie en temps réel si un disque à placer toucherait un point vert
 * Utilisé pour le feedback visuel lors du survol
 *
 * @param disc - Disque à tester
 * @param greenPoints - Points verts
 * @returns true si le disque toucherait au moins un vert
 */
export function wouldDiscTouchGreen(disc: Disc, greenPoints: Point[]): boolean {
  return greenPoints.some((green) => isPointCoveredByAnyDisc(green, [disc]));
}

/**
 * Compte combien de nouveaux points rouges seraient couverts par un disque
 * Utilisé pour le feedback visuel lors du survol
 *
 * @param disc - Disque à tester
 * @param redPoints - Points rouges
 * @param alreadyPlacedDiscs - Disques déjà placés
 * @returns Nombre de nouveaux rouges couverts
 */
export function countNewRedsCovered(
  disc: Disc,
  redPoints: Point[],
  alreadyPlacedDiscs: Disc[]
): number {
  let count = 0;
  for (const red of redPoints) {
    // Si déjà couvert, ne pas compter
    if (isPointCoveredByAnyDisc(red, alreadyPlacedDiscs)) {
      continue;
    }
    // Si ce disque couvre ce rouge, compter
    if (isPointCoveredByAnyDisc(red, [disc])) {
      count++;
    }
  }
  return count;
}
