import { getAdversaryBySlug } from '~/models/Adversary';
import { getSpiritBySlug } from '~/models/Spirit';
import type { Play, PlayInput, PlayResult } from './types';

export const PLAY_STORAGE_KEY = 'spirits-night:plays:v1';
const ARCHIVE_VERSION = 1;
export const MIN_PLAYER_COUNT = 1;
export const MAX_PLAYER_COUNT = 6;

interface PlayArchive {
  version: typeof ARCHIVE_VERSION;
  plays: Play[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validatePlayInput(value: unknown): value is PlayInput {
  if (!isRecord(value)) return false;
  if (!isValidDate(value.date)) return false;
  if (typeof value.adversarySlug !== 'string') return false;
  const adversary = getAdversaryBySlug(value.adversarySlug);
  if (!adversary || !Number.isInteger(value.level)) return false;
  if (!adversary.levels.some((row) => row.level === value.level)) return false;
  if (typeof value.playerCount !== 'number' || !Number.isInteger(value.playerCount)) return false;
  if (value.playerCount < MIN_PLAYER_COUNT || value.playerCount > MAX_PLAYER_COUNT) return false;
  if (!Array.isArray(value.spiritSlugs)) return false;
  if (value.spiritSlugs.length < MIN_PLAYER_COUNT || value.spiritSlugs.length > MAX_PLAYER_COUNT)
    return false;
  if (value.spiritSlugs.some((slug) => typeof slug !== 'string' || !getSpiritBySlug(slug)))
    return false;
  if (new Set(value.spiritSlugs).size !== value.spiritSlugs.length) return false;
  if (value.result !== 'win' && value.result !== 'loss') return false;
  return (
    value.feltDifficulty === 'easy' ||
    value.feltDifficulty === 'right' ||
    value.feltDifficulty === 'hard'
  );
}

function isPlay(value: unknown): value is Play {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    validatePlayInput(value)
  );
}

export function parsePlayArchive(text: string): PlayResult<Play[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, message: 'This file is not valid JSON.' };
  }

  if (!isRecord(parsed) || parsed.version !== ARCHIVE_VERSION || !Array.isArray(parsed.plays)) {
    return { ok: false, message: 'This is not a supported Spirits Night play log.' };
  }
  if (!parsed.plays.every(isPlay)) {
    return { ok: false, message: 'The play log contains an invalid game. Nothing was imported.' };
  }
  const plays = parsed.plays as Play[];
  if (new Set(plays.map((play) => play.id)).size !== plays.length) {
    return {
      ok: false,
      message: 'The play log contains duplicate game IDs. Nothing was imported.',
    };
  }
  return { ok: true, value: plays };
}

export function serializePlayArchive(plays: Play[]): string {
  const archive: PlayArchive = { version: ARCHIVE_VERSION, plays };
  return JSON.stringify(archive, null, 2);
}

export function loadPlays(storage: Pick<Storage, 'getItem'>): PlayResult<Play[]> {
  try {
    const saved = storage.getItem(PLAY_STORAGE_KEY);
    return saved === null ? { ok: true, value: [] } : parsePlayArchive(saved);
  } catch (error) {
    console.error({ event: 'play_log_read_failed', error });
    return { ok: false, message: 'Saved games could not be read from this browser.' };
  }
}

export function savePlays(storage: Pick<Storage, 'setItem'>, plays: Play[]): PlayResult<Play[]> {
  try {
    storage.setItem(PLAY_STORAGE_KEY, serializePlayArchive(plays));
    return { ok: true, value: plays };
  } catch (error) {
    console.error({ event: 'play_log_write_failed', error });
    return {
      ok: false,
      message:
        'The game could not be saved in this browser. Export your log and check available storage.',
    };
  }
}

export function mergeImportedPlays(existing: Play[], imported: Play[]): Play[] {
  const existingIds = new Set(existing.map((play) => play.id));
  return [...existing, ...imported.filter((play) => !existingIds.has(play.id))];
}
