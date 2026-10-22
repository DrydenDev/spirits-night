import { describe, expect, it, vi } from 'vitest';
import {
  loadPlays,
  mergeImportedPlays,
  parsePlayArchive,
  PLAY_STORAGE_KEY,
  savePlays,
  serializePlayArchive,
  validatePlayInput,
} from './storage';
import type { Play } from './types';

const samplePlay: Play = {
  id: 'game-1',
  date: '2026-10-21',
  adversarySlug: 'england',
  level: 4,
  spiritSlugs: ['river', 'lightning'],
  playerCount: 2,
  result: 'win',
  feltDifficulty: 'easy',
};

describe('play log storage', () => {
  it('round trips a versioned archive and reads an empty browser store', () => {
    expect(parsePlayArchive(serializePlayArchive([samplePlay]))).toEqual({
      ok: true,
      value: [samplePlay],
    });
    expect(loadPlays({ getItem: () => null })).toEqual({ ok: true, value: [] });
  });

  it('rejects invalid files and game records without returning partial data', () => {
    expect(parsePlayArchive('{broken').ok).toBe(false);
    expect(parsePlayArchive(JSON.stringify({ version: 2, plays: [] })).ok).toBe(false);
    expect(
      parsePlayArchive(
        JSON.stringify({ version: 1, plays: [samplePlay, { ...samplePlay, date: '2026-02-30' }] })
      ).ok
    ).toBe(false);
    expect(
      parsePlayArchive(JSON.stringify({ version: 1, plays: [samplePlay, samplePlay] })).ok
    ).toBe(false);
    expect(validatePlayInput({ ...samplePlay, adversarySlug: 'unknown' })).toBe(false);
    expect(validatePlayInput({ ...samplePlay, spiritSlugs: ['river', 'river'] })).toBe(false);
    expect(validatePlayInput({ ...samplePlay, level: 7 })).toBe(false);
  });

  it('merges imported games by ID without overwriting existing records', () => {
    const replacement = { ...samplePlay, result: 'loss' as const };
    const another = { ...samplePlay, id: 'game-2' };
    expect(mergeImportedPlays([samplePlay], [replacement, another])).toEqual([samplePlay, another]);
  });

  it('surfaces browser write failures and does not imply a successful save', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const storage = {
      setItem: vi.fn(() => {
        throw new Error('quota');
      }),
    };
    expect(savePlays(storage, [samplePlay])).toMatchObject({ ok: false });
    expect(storage.setItem).toHaveBeenCalledWith(PLAY_STORAGE_KEY, expect.any(String));
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'play_log_write_failed' })
    );
    errorSpy.mockRestore();
  });
});
