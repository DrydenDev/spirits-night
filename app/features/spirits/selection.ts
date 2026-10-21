import { getRandomSpirit } from '~/models/Spirit';
import { getTodaySeed } from '~/utils/random';

export function resolveSpiritShortcut(slug: string): string | null {
  if (slug !== 'random' && slug !== 'today') return null;
  const seed = slug === 'today' ? getTodaySeed() : null;
  return `/spirit/${getRandomSpirit(seed).slug}`;
}
