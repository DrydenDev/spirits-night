import { describe, it, expect } from 'vitest';
import { getRandomAdversary, getAdversaryBySlug, getAllAdversaries } from './Adversary';

describe('Adversary model', () => {
  describe('getAllAdversaries', () => {
    it('returns a non-empty array of adversaries', () => {
      const result = getAllAdversaries();
      expect(result.length).toBeGreaterThan(0);
    });

    it('each adversary has required fields and nested levels', () => {
      for (const adversary of getAllAdversaries()) {
        expect(adversary.id).toBeTruthy();
        expect(adversary.name).toBeTruthy();
        expect(adversary.slug).toBeTruthy();
        expect(adversary.expansion).toBeTruthy();
        expect(typeof adversary.difficulty).toBe('number');
        expect(adversary.escalationAbility.title).toBeTruthy();
        expect(Array.isArray(adversary.levels)).toBe(true);
        expect(Array.isArray(adversary.references)).toBe(true);
        expect(adversary.levels.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getAdversaryBySlug', () => {
    it('returns the adversary matching the given slug', () => {
      const allAdversaries = getAllAdversaries();
      const target = allAdversaries[0];
      const result = getAdversaryBySlug(target.slug);
      expect(result).toEqual(target);
    });

    it('includes levels and references on the returned adversary', () => {
      const allAdversaries = getAllAdversaries();
      const target = allAdversaries[0];
      const result = getAdversaryBySlug(target.slug)!;
      expect(Array.isArray(result.levels)).toBe(true);
      expect(Array.isArray(result.references)).toBe(true);
    });

    it('returns null for an unknown slug', () => {
      expect(getAdversaryBySlug('does-not-exist')).toBeNull();
    });
  });

  describe('getRandomAdversary', () => {
    it('returns an adversary and a level', () => {
      const { adversary, level } = getRandomAdversary('test-seed');
      expect(adversary).toBeDefined();
      expect(adversary.slug).toBeTruthy();
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(6);
    });

    it('returns the same adversary and level for the same seed', () => {
      const first = getRandomAdversary('2024/01/15');
      const second = getRandomAdversary('2024/01/15');
      expect(first.adversary).toEqual(second.adversary);
      expect(first.level).toBe(second.level);
    });

    it('returns different adversaries for different seeds (probabilistically)', () => {
      const results = new Set(['a', 'b', 'c', 'd', 'e'].map((s) => getRandomAdversary(s).adversary.slug));
      expect(results.size).toBeGreaterThan(1);
    });

    it('returns a level between 0 and 6 inclusive', () => {
      for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        const { level } = getRandomAdversary(seed);
        expect(level).toBeGreaterThanOrEqual(0);
        expect(level).toBeLessThanOrEqual(6);
      }
    });

    it('works with a null seed', () => {
      const result = getRandomAdversary(null);
      expect(result.adversary).toBeDefined();
    });
  });
});
