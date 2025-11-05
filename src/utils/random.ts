/**
 * Générateur de nombres pseudo-aléatoires (PRNG) basé sur seed
 * Utilise l'algorithme Mulberry32 pour la reproductibilité
 */
export class SeededRandom {
  private seed: number;

  /**
   * Crée un générateur avec une seed donnée
   * @param seed - Seed numérique ou chaîne (hashée en nombre)
   */
  constructor(seed: string | number) {
    if (typeof seed === 'string') {
      this.seed = this.hashString(seed);
    } else {
      this.seed = seed;
    }
  }

  /**
   * Hash une chaîne en nombre (simple)
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Génère un nombre aléatoire entre 0 (inclus) et 1 (exclus)
   * Algorithme Mulberry32
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Génère un entier aléatoire entre min (inclus) et max (exclus)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Génère un nombre flottant aléatoire entre min et max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Choisit un élément aléatoire dans un tableau
   */
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Mélange un tableau (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Génère une seed unique basée sur un numéro de niveau et un timestamp
 */
export function generateLevelSeed(levelNumber: number, timestamp?: number): string {
  const ts = timestamp || Date.now();
  return `level_${levelNumber}_${ts}`;
}

/**
 * Parse une seed pour extraire le numéro de niveau
 */
export function parseLevelSeed(seed: string): number | null {
  const match = seed.match(/^level_(\d+)_/);
  return match ? parseInt(match[1], 10) : null;
}
