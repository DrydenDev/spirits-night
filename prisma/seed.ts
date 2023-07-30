import { loadSpirits } from './seeds/spirit_seed';
import { loadAdversaries } from './seeds/adversary_seed';
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