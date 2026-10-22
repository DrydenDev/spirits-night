import rawData from '../../data/adversaries.yaml';
import type { Adversary, AdversaryLevel, AdversaryReference } from '~/types/domain';

interface AdversaryLevelYaml {
  level: number;
  title: string;
  difficulty: number;
  fear: string;
  description: string;
  phase?: string;
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
  reference?: AdversaryReferenceYaml[];
  creator?: string;
  source_url?: string;
  discussion_url?: string;
  source_note?: string;
  special_rules?: { title: string; phase: string; description: string }[];
  playtest_confidence?: 'more' | 'some' | 'limited';
  playtest_evidence?: string;
  impressions?: string;
  balance_note?: string;
  play_notes?: string[];
}

interface AdversariesYaml {
  adversaries: AdversaryYaml[];
}

const { adversaries: raw } = rawData as AdversariesYaml;

export function mapAdversary(a: AdversaryYaml): Adversary {
  const levels: AdversaryLevel[] = a.levels.map((l) => ({
    id: `${a.slug}-level-${l.level}`,
    adversaryId: a.slug,
    level: l.level,
    difficulty: l.difficulty,
    title: l.title,
    fearCards: l.fear,
    description: l.description,
  }));

  const referenceRows: AdversaryReferenceYaml[] = a.reference ?? [
    ...(a.special_rules ?? []).map((rule) => ({ ...rule, level: 0, type: 'Special Rule' })),
    { ...a.escalation, level: 0, type: 'Escalation', phase: 'Explore' },
    ...(a.loss_condition
      ? [{ ...a.loss_condition, level: 0, type: 'Loss Condition', phase: 'Traits' }]
      : []),
    ...a.levels.map((level) => ({
      title: level.title,
      level: level.level,
      type: 'Level',
      phase: level.phase ?? 'Traits',
      description: level.description,
    })),
  ];

  const references: AdversaryReference[] = referenceRows.map((r, i) => ({
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
    creator: a.creator,
    sourceUrl: a.source_url,
    discussionUrl: a.discussion_url,
    sourceNote: a.source_note,
    specialRules: a.special_rules?.map(({ title, description }) => ({ title, description })),
    playtestConfidence: a.playtest_confidence,
    playtestEvidence: a.playtest_evidence,
    impressions: a.impressions,
    balanceNote: a.balance_note,
    playNotes: a.play_notes,
  };
}

export const adversaries: Adversary[] = raw.map(mapAdversary);
