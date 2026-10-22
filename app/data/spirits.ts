import rawData from '../../data/spirits.yaml';
import { SPIRIT_THEMES, type SpiritThemeId } from './spiritThemes';
import type { Spirit } from '~/types/domain';

interface SpiritYaml {
  name: string;
  slug: string;
  playstyle?: string;
  expansion: string;
  complexity: string;
  incarna?: boolean;
  themes?: unknown;
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
const knownThemes = new Set<string>(SPIRIT_THEMES.map((theme) => theme.id));

export function parseSpiritThemes(value: unknown, spiritSlug: string): SpiritThemeId[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    new Set(value).size !== value.length ||
    !value.every((theme: unknown) => typeof theme === 'string' && knownThemes.has(theme))
  ) {
    throw new Error(`Invalid theme tags for Spirit: ${spiritSlug}`);
  }
  return value as SpiritThemeId[];
}

export const spirits: Spirit[] = raw.map((s) => ({
  id: s.slug,
  name: s.name,
  slug: s.slug,
  playstyle: s.playstyle?.trim() ?? null,
  expansion: s.expansion,
  complexity: s.complexity,
  complexityValue: COMPLEXITY_VALUE[s.complexity] ?? 0,
  incarna: s.incarna ?? false,
  themes: parseSpiritThemes(s.themes, s.slug),
  offense: s.attributes.offense,
  control: s.attributes.control,
  fear: s.attributes.fear,
  defense: s.attributes.defense,
  utility: s.attributes.utility,
}));
