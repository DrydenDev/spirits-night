import { prisma } from "~/utils/prisma"
import seedrandom from 'seedrandom';

export async function getRandomAdversary(seed) {
  const adversaryCount = await prisma.adversary.count();
  const generator = seedrandom(seed);
  const skip = Math.floor(generator() * adversaryCount);
  const randomAdversary = await prisma.adversary.findMany({
    take: 1,
    skip: skip,
    include: { levels: true }
  });
  const randomLevel = Math.round(generator() * 6);
  return { adversary: randomAdversary[0], level: randomLevel };
}

export async function getAdversaryBySlug(slug) {
  return await prisma.adversary.findUnique({
    where: { slug },
    include: { levels: true }
  });
}