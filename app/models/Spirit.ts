import seedrandom from 'seedrandom';
import { spirits } from '~/data/spirits';
import type { Spirit } from '~/types/domain';

export function getRandomSpirit(seed: string | null): Spirit {
  const generator = seedrandom(seed ?? undefined);
  const index = Math.floor(generator() * spirits.length);
  return spirits[index];
}

export function getSpiritBySlug(slug: string): Spirit | null {
  return spirits.find((s) => s.slug === slug) ?? null;
}

export function getAllSpirits(): Spirit[] {
  return spirits;
}
