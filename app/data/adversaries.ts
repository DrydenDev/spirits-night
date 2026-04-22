import rawData from '../../data/adversaries.yaml';
import type { Adversary, AdversaryLevel, AdversaryReference } from '~/types/domain';

interface AdversaryLevelYaml {
  level: number;
  title: string;
  difficulty: number;
  fear: string;
  description: string;
}

interface AdversaryReferenceYaml {
  title: string;
  level: number;
  maxLevel?: number;
  type: string;
  phase: string;
  description: string;
}

interface AdversaryYaml {
  name: string;
  slug: string;
  expansion: string;
  difficulty: number;
  loss_condition?: { title: string; description: string };
  escalation: { title: string; description: string };
  levels: AdversaryLevelYaml[];
  reference: AdversaryReferenceYaml[];
}

interface AdversariesYaml {
  adversaries: AdversaryYaml[];
}

const { adversaries: raw } = rawData as AdversariesYaml;

export const adversaries: Adversary[] = raw.map((a) => {
  const levels: AdversaryLevel[] = a.levels.map((l) => ({
    id: `${a.slug}-level-${l.level}`,
    adversaryId: a.slug,
    level: l.level,
    difficulty: l.difficulty,
    title: l.title,
    fearCards: l.fear,
    description: l.description,
  }));

  const references: AdversaryReference[] = a.reference.map((r, i) => ({
    id: `${a.slug}-ref-${i}`,
    adversaryId: a.slug,
    title: r.title,
    level: r.level,
    maxLevel: r.maxLevel ?? null,
    type: r.type,
    phase: r.phase,
    description: r.description,
  }));

  return {
    id: a.slug,
    name: a.name,
    slug: a.slug,
    expansion: a.expansion,
    difficulty: a.difficulty,
    lossCondition: a.loss_condition ?? null,
    escalationAbility: {
      title: a.escalation.title,
      description: a.escalation.description,
    },
    levels,
    references,
  };
});
