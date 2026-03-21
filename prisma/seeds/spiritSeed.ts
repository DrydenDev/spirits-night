import { PrismaClient } from '@prisma/client';
import { loadYamlFile, validExpansion } from './utils';

interface SpiritAttributes {
  offence: number;
  control: number;
  fear: number;
  defense: number;
  utility: number;
}

interface Spirit {
  name: string;
  slug: string;
  expansion: string;
  complexity: string;
  complexityValue: number;
  incarna: boolean;
  attributes: SpiritAttributes;
  /** Aspect names (e.g. "Regrowth", "Violence") — in YAML but not yet in schema. TODO: add aspects to schema. */
  aspects?: string[];
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
    // Destructure out fields not yet in the schema (aspects are in the YAML
    // but the schema migration hasn't been written yet — see TODO.md)
    const { attributes, aspects: _unusedAspects, ...spiritFields } = spirit;
    return {
      ...spiritFields,
      ...attributes,
      complexityValue: complexityValue[spiritFields.complexity],
    };
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