import { Prisma, PrismaClient } from '@prisma/client';
import { loadYamlFile, validExpansion } from './utils';

interface LossCondition {
  title: string;
  description: string;
}

interface EscalationAbility {
  title: string;
  description: string;
}

interface Adversary {
  name: string;
  expansion: string;
  slug: string;
  difficulty: number;
  loss_condition: LossCondition;
  escalation: EscalationAbility;
  levels: AdversaryLevel[];
  reference: AdversaryReference[];
}

interface AdversaryLevel {
  title: string;
  level: number;
  difficulty: number;
  fear: string;
  description: string;
}

interface AdversaryReference {
  title: string;
  level: number;
  maxLevel: number;
  type: string;
  phase: string;
  description: string;
}

function validAdversary(adversary: Adversary) {
  return validExpansion(adversary.expansion);
}

export async function loadAdversaries(prismaClient: PrismaClient) {
  const adversaryFile = process.env.ADVERSARY_FILE;
  if (!adversaryFile) return;

  const { adversaries } = loadYamlFile(adversaryFile);

  adversaries.forEach(async (adversary: Adversary) => {
    console.log(`Updating ${adversary.name}...`);
    if (!validAdversary(adversary)) {
      throw new Error(`Problem loading ${adversary}`);
    }

    const adversaryData = {
      name: adversary.name,
      expansion: adversary.expansion,
      slug: adversary.slug,
      difficulty: adversary.difficulty,
      lossCondition: adversary.loss_condition ? {
        title: adversary.loss_condition.title,
        description: adversary.loss_condition.description
      } : Prisma.DbNull,
      escalationAbility: {
        title: adversary.escalation.title,
        description: adversary.escalation.description
      }
    }

    const adversaryRow = await prismaClient.adversary.upsert({
      where: { name: adversary.name },
      update: { ...adversaryData },
      create: { ...adversaryData }
    })

    await prismaClient.adversaryLevel.deleteMany({ where: { adversaryId: adversaryRow.id } });
    const adversaryLevelData = adversary.levels.map((level) => {
      return {
        adversaryId: adversaryRow.id,
        level: level.level,
        difficulty: level.difficulty,
        title: level.title,
        fearCards: level.fear,
        description: level.description
      }
    });
    await prismaClient.adversaryLevel.createMany({ data: adversaryLevelData });

    await prismaClient.adversaryReference.deleteMany({ where: { adversaryId: adversaryRow.id } });
    const adversaryReferenceData = adversary.reference.map((ref) => {
      return {
        adversaryId: adversaryRow.id,
        level: ref.level,
        maxLevel: ref.maxLevel,
        title: ref.title,
        description: ref.description,
        phase: ref.phase,
        type: ref.type
      }
    });

    await prismaClient.adversaryReference.createMany({ data: adversaryReferenceData });
  });


  const adversaryCount = await prismaClient.adversary.count();
  console.log(`Adversary Count: ${adversaryCount}`);

  const levelsCount = await prismaClient.adversaryLevel.count();
  console.log(`Adversary Level Count: ${levelsCount}`);

  const refCount = await prismaClient.adversaryReference.count();
  console.log(`Adversary Reference Count: ${refCount}`);
}