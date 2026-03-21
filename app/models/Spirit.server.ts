import seedrandom from 'seedrandom';
import { prisma } from '~/utils/prisma';
import type { Spirit } from '~/types/domain';

export async function getRandomSpirit(seed: string | null): Promise<Spirit> {
  const spiritCount = await prisma.spirit.count();
  const generator = seedrandom(seed ?? undefined);
  const skip = Math.floor(generator() * spiritCount);
  const results = await prisma.spirit.findMany({ take: 1, skip });
  return results[0] as Spirit;
}

export async function getSpiritBySlug(slug: string): Promise<Spirit | null> {
  return (await prisma.spirit.findUnique({ where: { slug } })) as Spirit | null;
}

export async function getAllSpirits(): Promise<Spirit[]> {
  return (await prisma.spirit.findMany()) as Spirit[];
}
