import rawData from '../../data/spirits.yaml';
import type { Spirit } from '~/types/domain';

interface SpiritYaml {
  name: string;
  slug: string;
  playstyle?: string;
  expansion: string;
  complexity: string;
  incarna?: boolean;
  attributes: {
    offense: number;
    control: number;
    fear: number;
    defense: number;
    utility: number;
  };
  aspects?: string[];
}

interface SpiritsYaml {
  spirits: SpiritYaml[];
}

const COMPLEXITY_VALUE: Record<string, number> = {
  Low: 0,
  Moderate: 1,
  High: 2,
  'Very High': 3,
};

const { spirits: raw } = rawData as SpiritsYaml;

export const spirits: Spirit[] = raw.map((s) => ({
  id: s.slug,
  name: s.name,
  slug: s.slug,
  playstyle: s.playstyle?.trim() ?? null,
  expansion: s.expansion,
  complexity: s.complexity,
  complexityValue: COMPLEXITY_VALUE[s.complexity] ?? 0,
  incarna: s.incarna ?? false,
  offense: s.attributes.offense,
  control: s.attributes.control,
  fear: s.attributes.fear,
  defense: s.attributes.defense,
  utility: s.attributes.utility,
}));
