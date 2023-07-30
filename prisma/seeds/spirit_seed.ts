import { PrismaClient } from '@prisma/client';
import { loadYamlFile, validExpansion } from './utils';

interface Spirit {
  name: string;
  slug: string;
  expansion: string;
  complexity: string;
  complexityValue: number;
  incarna: boolean;
}

const complexityValue: {[index: string]: number} = {
  "Low": 0,
  "Moderate": 1,
  "High": 2,
  "Very High": 3
}

function validSpirit(spirit: Spirit) {
  return validExpansion(spirit.expansion);
}

export async function loadSpirits(prismaClient: PrismaClient) {
  const spiritFile = process.env.SPIRIT_FILE;
  if (!spiritFile) return;

  const { spirits } = loadYamlFile(spiritFile);
  const augmentedSpirits = spirits.map((spirit: Spirit) => {
    return {...spirit, complexityValue: complexityValue[spirit.complexity]};
  })

  augmentedSpirits.forEach(async (spirit: Spirit) => {
    console.log(`Updating ${spirit.name}...`);
    if (!validSpirit(spirit)) {
      throw new Error(`Problem loading ${spirit}`);
    }

    await prismaClient.spirit.upsert({
      where: { name: spirit.name },
      update: { ...spirit },
      create: { ...spirit }
    })
  });
  
  const spiritCount = await prismaClient.spirit.count();
  console.log(`Spirit Count: ${spiritCount}`);
}