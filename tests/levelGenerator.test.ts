/**
 * Tests pour le générateur de niveaux
 * Vérifie la génération inversée, la solvabilité et la reproductibilité
 */

import { describe, it, expect } from 'vitest';
import { generateLevel, verifyLevelSolvability } from '../src/core/levelGenerator';
import { getLevelParams, getDefaultLevelSeed } from '../src/levels/config';

describe('Level Generator - Méthode Inversée', () => {
  it('devrait générer un niveau complet avec tous les éléments', () => {
    const params = getLevelParams(1);
    const seed = getDefaultLevelSeed(1);
    const level = generateLevel(1, seed, params);

    // Vérifier la structure du niveau
    expect(level).toHaveProperty('levelNumber', 1);
    expect(level).toHaveProperty('seed', seed);
    expect(level).toHaveProperty('redPoints');
    expect(level).toHaveProperty('greenPoints');
    expect(level).toHaveProperty('params');
    expect(level).toHaveProperty('boardWidth');
    expect(level).toHaveProperty('boardHeight');
  });

  it('devrait générer le bon nombre de points', () => {
    const params = getLevelParams(1);
    const seed = getDefaultLevelSeed(1);
    const level = generateLevel(1, seed, params);

    // Le nombre peut varier légèrement à cause des rejets
    expect(level.redPoints.length).toBeGreaterThan(0);
    expect(level.greenPoints.length).toBeGreaterThan(0);

    // Devrait être proche des paramètres
    expect(level.redPoints.length).toBeGreaterThanOrEqual(params.numRedPoints * 0.8);
    expect(level.greenPoints.length).toBeGreaterThanOrEqual(params.numGreenPoints * 0.8);
  });

  it('devrait garantir la reproductibilité avec la même seed', () => {
    const params = getLevelParams(5);
    const seed = 'test-seed-reproducibility';

    const level1 = generateLevel(5, seed, params);
    const level2 = generateLevel(5, seed, params);

    // Les deux niveaux doivent être identiques
    expect(level1.redPoints.length).toBe(level2.redPoints.length);
    expect(level1.greenPoints.length).toBe(level2.greenPoints.length);

    // Vérifier que les positions des points sont identiques
    for (let i = 0; i < level1.redPoints.length; i++) {
      expect(level1.redPoints[i].x).toBe(level2.redPoints[i].x);
      expect(level1.redPoints[i].y).toBe(level2.redPoints[i].y);
    }

    for (let i = 0; i < level1.greenPoints.length; i++) {
      expect(level1.greenPoints[i].x).toBe(level2.greenPoints[i].x);
      expect(level1.greenPoints[i].y).toBe(level2.greenPoints[i].y);
    }
  });

  it('devrait générer des niveaux différents avec des seeds différentes', () => {
    const params = getLevelParams(1);

    const level1 = generateLevel(1, 'seed-A', params);
    const level2 = generateLevel(1, 'seed-B', params);

    // Au moins quelques points devraient être différents
    let differentPoints = 0;
    for (let i = 0; i < Math.min(level1.redPoints.length, level2.redPoints.length); i++) {
      if (
        level1.redPoints[i].x !== level2.redPoints[i].x ||
        level1.redPoints[i].y !== level2.redPoints[i].y
      ) {
        differentPoints++;
      }
    }

    expect(differentPoints).toBeGreaterThan(0);
  });

  it('devrait placer les points dans les limites du plateau', () => {
    const params = getLevelParams(1);
    const seed = getDefaultLevelSeed(1);
    const level = generateLevel(1, seed, params);

    // Vérifier que tous les points rouges sont dans les limites
    level.redPoints.forEach((point) => {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(level.boardWidth);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(level.boardHeight);
    });

    // Vérifier que tous les points verts sont dans les limites
    level.greenPoints.forEach((point) => {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(level.boardWidth);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(level.boardHeight);
    });
  });

  it('devrait vérifier la solvabilité du niveau', () => {
    const params = getLevelParams(1);
    const seed = getDefaultLevelSeed(1);
    const level = generateLevel(1, seed, params);

    const isSolvable = verifyLevelSolvability(level);
    expect(isSolvable).toBe(true);
  });

  it('devrait générer des niveaux pour toutes les difficultés', () => {
    const difficulties = [1, 11, 26, 41]; // Facile, Débutant, Intermédiaire, Difficile

    difficulties.forEach((levelNumber) => {
      const params = getLevelParams(levelNumber);
      const seed = getDefaultLevelSeed(levelNumber);
      const level = generateLevel(levelNumber, seed, params);

      expect(level).toBeDefined();
      expect(level.redPoints.length).toBeGreaterThan(0);
      expect(level.greenPoints.length).toBeGreaterThan(0);
    });
  });

  it('devrait respecter les paramètres de rayon de disque', () => {
    const params = getLevelParams(1);
    const seed = getDefaultLevelSeed(1);
    const level = generateLevel(1, seed, params);

    expect(level.params.discRadius).toBe(params.discRadius);
    expect(level.params.numDiscs).toBe(params.numDiscs);
  });
});

describe('Level Configuration', () => {
  it('devrait avoir des paramètres cohérents pour chaque difficulté', () => {
    for (let i = 1; i <= 50; i++) {
      const params = getLevelParams(i);

      expect(params.discRadius).toBeGreaterThan(0);
      expect(params.numDiscs).toBeGreaterThan(0);
      expect(params.numRedPoints).toBeGreaterThan(0);
      expect(params.numGreenPoints).toBeGreaterThan(0);
      expect(params.safetyMargin).toBeGreaterThanOrEqual(0);
      expect(params.minDiscDistance).toBeGreaterThan(0);
    }
  });

  it('devrait avoir une progression de difficulté logique', () => {
    const easy = getLevelParams(1);
    const medium = getLevelParams(26);
    const hard = getLevelParams(41);

    // Les niveaux difficiles devraient avoir plus de points
    expect(hard.numRedPoints).toBeGreaterThanOrEqual(easy.numRedPoints);
    expect(hard.numGreenPoints).toBeGreaterThanOrEqual(easy.numGreenPoints);

    // Les niveaux difficiles devraient avoir plus de disques à placer
    expect(hard.numDiscs).toBeGreaterThanOrEqual(easy.numDiscs);
  });
});
