import type { SpiritThemeId } from '~/data/spiritThemes';

export interface Spirit {
  id: string;
  name: string;
  slug: string;
  playstyle: string | null;
  expansion: string;
  complexity: string;
  complexityValue: number;
  incarna: boolean;
  themes: SpiritThemeId[];
  offense: number;
  control: number;
  fear: number;
  defense: number;
  utility: number;
}

export interface AdversaryLevel {
  id: string;
  adversaryId: string;
  level: number;
  difficulty: number;
  title: string;
  fearCards: string;
  description: string;
}

export interface AdversaryReference {
  id: string;
  adversaryId: string;
  title: string;
  level: number;
  maxLevel: number | null;
  type: string;
  phase: string;
  description: string;
}

export interface LossCondition {
  title: string;
  description: string;
}

export interface EscalationAbility {
  title: string;
  description: string;
}

export interface Adversary {
  id: string;
  name: string;
  slug: string;
  expansion: string;
  difficulty: number;
  lossCondition: LossCondition | null;
  escalationAbility: EscalationAbility;
  levels: AdversaryLevel[];
  references: AdversaryReference[];
  creator?: string;
  sourceUrl?: string;
  discussionUrl?: string;
  sourceNote?: string;
  specialRules?: { title: string; description: string }[];
  playtestConfidence?: 'more' | 'some' | 'limited';
  playtestEvidence?: string;
  impressions?: string;
  balanceNote?: string;
  playNotes?: string[];
}
