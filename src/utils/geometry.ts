/**
 * Utilitaires géométriques pour le jeu Paintball Puzzle
 */

import { Point, Disc } from '../types';

/**
 * Calcule la distance euclidienne entre deux points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Vérifie si un point est à l'intérieur d'un disque
 * @param point - Point à tester
 * @param disc - Disque
 * @returns true si le point est couvert par le disque
 */
export function isPointInDisc(point: Point, disc: Disc): boolean {
  return distance(point, disc.center) <= disc.radius;
}

/**
 * Vérifie si un point est couvert par au moins un disque d'une liste
 */
export function isPointCoveredByAnyDisc(point: Point, discs: Disc[]): boolean {
  return discs.some((disc) => isPointInDisc(point, disc));
}

/**
 * Vérifie si deux disques se chevauchent
 */
export function discsOverlap(disc1: Disc, disc2: Disc): boolean {
  const dist = distance(disc1.center, disc2.center);
  return dist < disc1.radius + disc2.radius;
}

/**
 * Vérifie si un point est dans les limites d'un rectangle
 */
export function isPointInBounds(
  point: Point,
  width: number,
  height: number,
  margin: number = 0
): boolean {
  return (
    point.x >= margin &&
    point.x <= width - margin &&
    point.y >= margin &&
    point.y <= height - margin
  );
}

/**
 * Génère un point aléatoire dans un disque (distribution uniforme)
 * Utilise la méthode de rejet avec correction pour uniformité
 */
export function randomPointInDisc(
  disc: Disc,
  random: () => number
): Point {
  // Pour une distribution uniforme dans un disque, on utilise sqrt pour le rayon
  const angle = random() * 2 * Math.PI;
  const r = Math.sqrt(random()) * disc.radius;

  return {
    x: disc.center.x + r * Math.cos(angle),
    y: disc.center.y + r * Math.sin(angle)
  };
}

/**
 * Génère un point aléatoire dans un rectangle
 */
export function randomPointInRect(
  width: number,
  height: number,
  random: () => number,
  margin: number = 0
): Point {
  return {
    x: margin + random() * (width - 2 * margin),
    y: margin + random() * (height - 2 * margin)
  };
}

/**
 * Index spatial simple basé sur une grille
 * Optimise les requêtes de collision en divisant l'espace en cellules
 */
export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Point[]>;
  private width: number;
  private height: number;

  constructor(width: number, height: number, cellSize: number = 50) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  /**
   * Retourne la clé de cellule pour un point
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Ajoute un point à la grille
   */
  addPoint(point: Point): void {
    const key = this.getCellKey(point.x, point.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(point);
  }

  /**
   * Ajoute plusieurs points
   */
  addPoints(points: Point[]): void {
    points.forEach((p) => this.addPoint(p));
  }

  /**
   * Retourne tous les points dans les cellules touchées par un disque
   * (requête rapide pour collision)
   */
  getPointsNearDisc(disc: Disc): Point[] {
    const result: Point[] = [];
    const { center, radius } = disc;

    // Calculer les cellules touchées par le disque
    const minCellX = Math.floor((center.x - radius) / this.cellSize);
    const maxCellX = Math.floor((center.x + radius) / this.cellSize);
    const minCellY = Math.floor((center.y - radius) / this.cellSize);
    const maxCellY = Math.floor((center.y + radius) / this.cellSize);

    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        const points = this.grid.get(key);
        if (points) {
          result.push(...points);
        }
      }
    }

    return result;
  }

  /**
   * Clear la grille
   */
  clear(): void {
    this.grid.clear();
  }
}
