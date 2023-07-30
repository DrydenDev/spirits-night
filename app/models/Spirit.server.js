import { prisma } from "~/utils/prisma"
import seedrandom from 'seedrandom';

export async function getRandomSpirit(seed) {
  const spiritCount = await prisma.spirit.count();
  const generator = seedrandom(seed);
  const skip = Math.floor(generator() * spiritCount);
  const randomSpirit = await prisma.spirit.findMany({
    take: 1,
    skip: skip,
  });
  return randomSpirit[0];
}

export async function getSpiritBySlug(slug) {
  return await prisma.spirit.findUnique({
    where: { slug }
  });
}

export async function getAllSpirits() {
  return await prisma.spirit.findMany();
}