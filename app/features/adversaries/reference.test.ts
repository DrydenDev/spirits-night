import { describe, expect, it } from 'vitest';
import { getAdversaryBySlug } from '~/models/Adversary';
import { referencesAtLevel } from './reference';

describe('adversary reference', () => {
  it('shows only rules active at the chosen level', () => {
    const england = getAdversaryBySlug('england');
    expect(england).not.toBeNull();
    const atZero = referencesAtLevel(england!.references, 0);
    const atSix = referencesAtLevel(england!.references, 6);
    expect(atZero.every((reference) => reference.level <= 0)).toBe(true);
    expect(atSix.every((reference) => reference.maxLevel === null || reference.maxLevel >= 6)).toBe(
      true
    );
    expect(atSix.length).toBeGreaterThan(atZero.length);
  });
});
