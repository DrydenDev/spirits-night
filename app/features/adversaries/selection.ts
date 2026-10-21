import {
  ADVERSARY_MAX_LEVEL,
  ADVERSARY_MIN_LEVEL,
  TODAY_MIN_ADVERSARY_LEVEL,
} from '~/constants/game';
import { getRandomAdversary } from '~/models/Adversary';
import { getTodaySeed } from '~/utils/random';

export function parseAdversaryLevel(rawLevel: string | undefined): number | null {
  if (rawLevel === undefined) return null;
  const parsedLevel = parseInt(rawLevel, 10);
  if (Number.isNaN(parsedLevel)) return null;
  return Math.min(Math.max(parsedLevel, ADVERSARY_MIN_LEVEL), ADVERSARY_MAX_LEVEL);
}

export function resolveAdversaryShortcut(slug: string, rawLevel?: string): string | null {
  if (slug !== 'random' && slug !== 'today') return null;
  const seed = slug === 'today' ? getTodaySeed() : null;
  const { adversary, level } = getRandomAdversary(seed);
  const desiredLevel =
    parseAdversaryLevel(rawLevel) ??
    (slug === 'today' ? Math.max(TODAY_MIN_ADVERSARY_LEVEL, level) : level);
  return `/adversary/${adversary.slug}/${desiredLevel}`;
}
