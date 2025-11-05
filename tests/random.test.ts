/**
 * Tests pour le générateur de nombres aléatoires avec seed
 */

import { describe, it, expect } from 'vitest';
import { SeededRandom, generateLevelSeed, parseLevelSeed } from '../src/utils/random';

describe('SeededRandom', () => {
  it('devrait générer les mêmes nombres avec la même seed', () => {
    const rng1 = new SeededRandom('test-seed-123');
    const rng2 = new SeededRandom('test-seed-123');

    const numbers1 = Array.from({ length: 10 }, () => rng1.next());
    const numbers2 = Array.from({ length: 10 }, () => rng2.next());

    expect(numbers1).toEqual(numbers2);
  });

  it('devrait générer des nombres différents avec des seeds différentes', () => {
    const rng1 = new SeededRandom('seed-1');
    const rng2 = new SeededRandom('seed-2');

    const numbers1 = Array.from({ length: 10 }, () => rng1.next());
    const numbers2 = Array.from({ length: 10 }, () => rng2.next());

    expect(numbers1).not.toEqual(numbers2);
  });

  it('devrait générer des nombres entre 0 et 1', () => {
    const rng = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const num = rng.next();
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThan(1);
    }
  });

  it('devrait générer des entiers dans la plage correcte', () => {
    const rng = new SeededRandom('test');

    for (let i = 0; i < 100; i++) {
      const num = rng.nextInt(10, 20);
      expect(num).toBeGreaterThanOrEqual(10);
      expect(num).toBeLessThan(20);
      expect(Number.isInteger(num)).toBe(true);
    }
  });

  it('devrait gérer les seeds numériques et string', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom('12345');

    // Ne devraient pas être identiques car hashés différemment
    expect(rng1.next()).not.toEqual(rng2.next());
  });

  it('devrait mélanger un tableau de manière déterministe', () => {
    const arr = [1, 2, 3, 4, 5];
    const rng1 = new SeededRandom('shuffle-test');
    const rng2 = new SeededRandom('shuffle-test');

    const shuffled1 = rng1.shuffle(arr);
    const shuffled2 = rng2.shuffle(arr);

    expect(shuffled1).toEqual(shuffled2);
    expect(shuffled1.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('generateLevelSeed', () => {
  it('devrait générer une seed avec le format correct', () => {
    const seed = generateLevelSeed(5, 1000000);
    expect(seed).toMatch(/^level_\d+_\d+$/);
  });

  it('devrait générer des seeds différentes pour des niveaux différents', () => {
    const seed1 = generateLevelSeed(1, 1000);
    const seed2 = generateLevelSeed(2, 1000);
    expect(seed1).not.toEqual(seed2);
  });

  it('devrait parser correctement le numéro de niveau', () => {
    const seed = generateLevelSeed(42, 1000000);
    const levelNumber = parseLevelSeed(seed);
    expect(levelNumber).toBe(42);
  });
});
