import { describe, expect, it } from 'vitest';
import { getAllSpirits, getSpiritBySlug } from '~/models/Spirit';
import { parseSpiritThemes } from './spirits';
import { SPIRIT_THEMES } from './spiritThemes';

describe('Spirit themes', () => {
  it('gives every Spirit overlapping curated themes and every theme a useful pool', () => {
    const spirits = getAllSpirits();
    const ids = SPIRIT_THEMES.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(spirits.every((spirit) => spirit.themes.length >= 2)).toBe(true);
    for (const theme of SPIRIT_THEMES) {
      expect(
        spirits.filter((spirit) => spirit.themes.includes(theme.id)).length
      ).toBeGreaterThanOrEqual(3);
    }
    expect(getSpiritBySlug('wildfire')?.themes).toContain('fire');
    expect(getSpiritBySlug('thunderspeaker')?.themes).toContain('dahan');
    expect(getSpiritBySlug('burning-plague')?.themes).toContain('vengeance');
    expect(spirits.every((spirit) => spirit.themes.includes('incarna') === spirit.incarna)).toBe(true);
  });

  it('rejects missing, duplicate, or unknown theme tags', () => {
    expect(parseSpiritThemes(['fire', 'earth'], 'example')).toEqual(['fire', 'earth']);
    expect(() => parseSpiritThemes(undefined, 'example')).toThrow(
      'Invalid theme tags for Spirit: example'
    );
    expect(() => parseSpiritThemes(['fire', 'fire'], 'example')).toThrow(
      'Invalid theme tags for Spirit: example'
    );
    expect(() => parseSpiritThemes(['unknown'], 'example')).toThrow(
      'Invalid theme tags for Spirit: example'
    );
  });
});
