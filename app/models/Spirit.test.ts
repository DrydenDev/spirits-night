import { describe, it, expect } from 'vitest';
import { getRandomSpirit, getSpiritBySlug, getAllSpirits } from './Spirit';

describe('Spirit model', () => {
  describe('getAllSpirits', () => {
    it('returns a non-empty array of spirits', () => {
      const result = getAllSpirits();
      expect(result.length).toBeGreaterThan(0);
    });

    it('each spirit has required fields', () => {
      for (const spirit of getAllSpirits()) {
        expect(spirit.id).toBeTruthy();
        expect(spirit.name).toBeTruthy();
        expect(spirit.slug).toBeTruthy();
        expect(spirit.expansion).toBeTruthy();
        expect(spirit.complexity).toBeTruthy();
        expect(typeof spirit.complexityValue).toBe('number');
        expect(typeof spirit.incarna).toBe('boolean');
      }
    });
  });

  describe('getSpiritBySlug', () => {
    it('returns the spirit matching the given slug', () => {
      const allSpirits = getAllSpirits();
      const target = allSpirits[0];
      const result = getSpiritBySlug(target.slug);
      expect(result).toEqual(target);
    });

    it('returns null for an unknown slug', () => {
      expect(getSpiritBySlug('does-not-exist')).toBeNull();
    });
  });

  describe('getRandomSpirit', () => {
    it('returns a spirit', () => {
      const result = getRandomSpirit('test-seed');
      expect(result).toBeDefined();
      expect(result.slug).toBeTruthy();
    });

    it('returns the same spirit for the same seed', () => {
      const first = getRandomSpirit('2024/01/15');
      const second = getRandomSpirit('2024/01/15');
      expect(first).toEqual(second);
    });

    it('returns different spirits for different seeds (probabilistically)', () => {
      const results = new Set(['a', 'b', 'c', 'd', 'e'].map((s) => getRandomSpirit(s).slug));
      expect(results.size).toBeGreaterThan(1);
    });

    it('works with a null seed', () => {
      const result = getRandomSpirit(null);
      expect(result).toBeDefined();
    });
  });
});
