import seedrandom from 'seedrandom';
import { prisma } from '~/utils/prisma';
import type { Adversary } from '~/types/domain';
import { ADVERSARY_MAX_LEVEL } from '~/constants/game';

export async function getRandomAdversary(
  seed: string | null
): Promise<{ adversary: Adversary; level: number }> {
  const adversaryCount = await prisma.adversary.count();
  const generator = seedrandom(seed ?? undefined);
  const skip = Math.floor(generator() * adversaryCount);
  const results = await prisma.adversary.findMany({
    take: 1,
    skip,
    include: { levels: true, references: true },
  });
  const randomLevel = Math.round(generator() * ADVERSARY_MAX_LEVEL);
  return { adversary: results[0] as unknown as Adversary, level: randomLevel };
}

export async function getAdversaryBySlug(slug: string): Promise<Adversary | null> {
  return (await prisma.adversary.findUnique({
    where: { slug },
    include: { levels: true, references: true },
  })) as unknown as Adversary | null;
}

export async function getAllAdversaries(): Promise<Adversary[]> {
  return (await prisma.adversary.findMany({ include: { levels: true } })) as unknown as Adversary[];
}
