import seedrandom from 'seedrandom';
import { adversaries } from '~/data/adversaries';
import type { Adversary } from '~/types/domain';
import { ADVERSARY_MAX_LEVEL } from '~/constants/game';

export function getRandomAdversary(seed: string | null): { adversary: Adversary; level: number } {
  const generator = seedrandom(seed ?? undefined);
  const index = Math.floor(generator() * adversaries.length);
  const randomLevel = Math.round(generator() * ADVERSARY_MAX_LEVEL);
  return { adversary: adversaries[index], level: randomLevel };
}

export function getAdversaryBySlug(slug: string): Adversary | null {
  return adversaries.find((a) => a.slug === slug) ?? null;
}

export function getAllAdversaries(): Adversary[] {
  return adversaries;
}
