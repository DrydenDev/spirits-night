import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import YAML from 'yaml';
import internal from 'stream';

const prisma = new PrismaClient();

function loadYamlFile(filename: string) {
  const file = fs.readFileSync(filename, 'utf8');
  return YAML.parse(file);
}

async function loadSpirits() {
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
    return [
      "Spirit Island",
      "Feather and Flame",
      "Branch and Claw",
      "Jagged Earth",
      "Horizons",
      "Nature Incarnate"
    ].includes(spirit.expansion);
  }

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

    await prisma.spirit.upsert({
      where: { name: spirit.name },
      update: { ...spirit },
      create: { ...spirit }
    })
  });
  
  const spiritCount = await prisma.spirit.count();
  console.log(`Spirit Count: ${spiritCount}`);
}

async function main() {
  await loadSpirits();
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