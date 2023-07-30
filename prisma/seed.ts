import { loadSpirits } from './seeds/spiritSeed';
import { loadAdversaries } from './seeds/adversarySeed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await loadSpirits(prisma);
  await loadAdversaries(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })