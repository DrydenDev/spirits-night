
export async function getRandomSpirit() {
  const spiritCount = await prisma.spirit.count();
  const skip = Math.floor(Math.random() * spiritCount);
  const randomSpirit = await prisma.spirit.findMany({
    take: 1,
    skip: skip,
  });
  return randomSpirit[0];
}