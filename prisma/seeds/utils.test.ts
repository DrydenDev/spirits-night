import { describe, it, expect } from 'vitest';
import { validExpansion } from './utils';

describe('validExpansion', () => {
  it('returns true for all shipped expansions', () => {
    const validExpansions = [
      'Spirit Island',
      'Feather and Flame',
      'Branch and Claw',
      'Jagged Earth',
      'Horizons',
      'Nature Incarnate',
    ];

    for (const expansion of validExpansions) {
      expect(validExpansion(expansion), `Expected "${expansion}" to be valid`).toBe(true);
    }
  });

  it('returns false for an unknown expansion name', () => {
    expect(validExpansion('Unknown Expansion')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(validExpansion('')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(validExpansion('spirit island')).toBe(false);
    expect(validExpansion('JAGGED EARTH')).toBe(false);
  });

  it('does not match partial expansion names', () => {
    expect(validExpansion('Spirit')).toBe(false);
    expect(validExpansion('Jagged')).toBe(false);
  });
});
