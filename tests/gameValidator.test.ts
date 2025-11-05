/**
 * Tests pour le validateur de jeu
 * Vérifie la détection de victoire et défaite
 */

import { describe, it, expect } from 'vitest';
import { validateGameState, wouldDiscTouchGreen, countNewRedsCovered } from '../src/core/gameValidator';
import { Point, Disc } from '../src/types';

describe('Game Validator', () => {
  it('devrait détecter une victoire quand tous les rouges sont couverts', () => {
    const redPoints: Point[] = [
      { x: 100, y: 100 },
      { x: 200, y: 200 }
    ];
    const greenPoints: Point[] = [
      { x: 400, y: 400 }
    ];
    const placedDiscs: Disc[] = [
      { center: { x: 100, y: 100 }, radius: 50 },
      { center: { x: 200, y: 200 }, radius: 50 }
    ];

    const result = validateGameState(redPoints, greenPoints, placedDiscs, 800, 600);

    expect(result.allRedsCovered).toBe(true);
    expect(result.noGreensTouched).toBe(true);
    expect(result.isWon).toBe(true);
    expect(result.redsCovered).toBe(2);
    expect(result.greensTouched).toBe(0);
  });

  it('devrait détecter une défaite quand un vert est touché', () => {
    const redPoints: Point[] = [
      { x: 100, y: 100 }
    ];
    const greenPoints: Point[] = [
      { x: 150, y: 100 } // Proche du rouge
    ];
    const placedDiscs: Disc[] = [
      { center: { x: 100, y: 100 }, radius: 60 } // Touche le vert
    ];

    const result = validateGameState(redPoints, greenPoints, placedDiscs, 800, 600);

    expect(result.allRedsCovered).toBe(true);
    expect(result.noGreensTouched).toBe(false);
    expect(result.isWon).toBe(false);
    expect(result.greensTouched).toBe(1);
  });

  it('devrait détecter une défaite quand des rouges ne sont pas couverts', () => {
    const redPoints: Point[] = [
      { x: 100, y: 100 },
      { x: 400, y: 400 } // Loin
    ];
    const greenPoints: Point[] = [
      { x: 500, y: 500 }
    ];
    const placedDiscs: Disc[] = [
      { center: { x: 100, y: 100 }, radius: 50 }
    ];

    const result = validateGameState(redPoints, greenPoints, placedDiscs, 800, 600);

    expect(result.allRedsCovered).toBe(false);
    expect(result.noGreensTouched).toBe(true);
    expect(result.isWon).toBe(false);
    expect(result.redsCovered).toBe(1);
  });

  it('devrait fonctionner avec aucun disque placé', () => {
    const redPoints: Point[] = [
      { x: 100, y: 100 }
    ];
    const greenPoints: Point[] = [
      { x: 400, y: 400 }
    ];
    const placedDiscs: Disc[] = [];

    const result = validateGameState(redPoints, greenPoints, placedDiscs, 800, 600);

    expect(result.allRedsCovered).toBe(false);
    expect(result.noGreensTouched).toBe(true);
    expect(result.isWon).toBe(false);
    expect(result.redsCovered).toBe(0);
  });

  it('devrait détecter si un disque toucherait un vert', () => {
    const greenPoints: Point[] = [
      { x: 100, y: 100 },
      { x: 300, y: 300 }
    ];

    const disc1: Disc = { center: { x: 100, y: 100 }, radius: 50 };
    const disc2: Disc = { center: { x: 500, y: 500 }, radius: 50 };

    expect(wouldDiscTouchGreen(disc1, greenPoints)).toBe(true);
    expect(wouldDiscTouchGreen(disc2, greenPoints)).toBe(false);
  });

  it('devrait compter les nouveaux rouges couverts', () => {
    const redPoints: Point[] = [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 300, y: 100 }
    ];

    const alreadyPlaced: Disc[] = [
      { center: { x: 100, y: 100 }, radius: 40 }
    ];

    const newDisc: Disc = { center: { x: 200, y: 100 }, radius: 40 };

    const count = countNewRedsCovered(newDisc, redPoints, alreadyPlaced);

    // Devrait couvrir le point à (200, 100) seulement
    expect(count).toBe(1);
  });

  it('devrait gérer plusieurs disques qui se chevauchent', () => {
    const redPoints: Point[] = [
      { x: 100, y: 100 }
    ];
    const greenPoints: Point[] = [
      { x: 400, y: 400 }
    ];
    const placedDiscs: Disc[] = [
      { center: { x: 90, y: 90 }, radius: 30 },
      { center: { x: 110, y: 110 }, radius: 30 }
    ];

    const result = validateGameState(redPoints, greenPoints, placedDiscs, 800, 600);

    // Le point devrait être couvert par au moins un disque
    expect(result.allRedsCovered).toBe(true);
    expect(result.redsCovered).toBe(1);
  });

  it('devrait générer un message approprié pour les défaites', () => {
    const redPoints: Point[] = [
      { x: 100, y: 100 },
      { x: 200, y: 200 }
    ];
    const greenPoints: Point[] = [
      { x: 150, y: 150 }
    ];
    const placedDiscs: Disc[] = [
      { center: { x: 150, y: 150 }, radius: 80 } // Touche le vert et couvre les rouges
    ];

    const result = validateGameState(redPoints, greenPoints, placedDiscs, 800, 600);

    expect(result.isWon).toBe(false);
    expect(result.message).toContain('vert');
  });
});

describe('Geometry Validation', () => {
  it('devrait détecter quand un point est exactement sur le bord du disque', () => {
    const redPoints: Point[] = [
      { x: 150, y: 100 } // Distance = 50 du centre
    ];
    const greenPoints: Point[] = [];
    const placedDiscs: Disc[] = [
      { center: { x: 100, y: 100 }, radius: 50 }
    ];

    const result = validateGameState(redPoints, greenPoints, placedDiscs, 800, 600);

    // Un point sur le bord devrait être considéré comme couvert
    expect(result.allRedsCovered).toBe(true);
  });

  it('devrait gérer correctement les grands nombres de points', () => {
    // Générer beaucoup de points
    const redPoints: Point[] = Array.from({ length: 100 }, (_, i) => ({
      x: (i % 10) * 50 + 50,
      y: Math.floor(i / 10) * 50 + 50
    }));

    const greenPoints: Point[] = [];

    const placedDiscs: Disc[] = Array.from({ length: 10 }, (_, i) => ({
      center: { x: i * 80 + 50, y: 300 },
      radius: 80
    }));

    // Ne devrait pas planter et devrait terminer rapidement
    const result = validateGameState(redPoints, greenPoints, placedDiscs, 800, 600);

    expect(result).toBeDefined();
    expect(result.totalReds).toBe(100);
  });
});
