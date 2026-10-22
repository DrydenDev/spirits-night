import { SPIRIT_THEMES, type SpiritThemeId } from '~/data/spiritThemes';
import type { Play } from '~/features/plays/types';
import type { Spirit } from '~/types/domain';

export const RECENT_GAME_COUNT = 5;
export const SHORTLIST_SIZE = 5;
export const GO_TO_MINIMUM_PLAYS = 2;
export const SUGGESTED_THEME_COUNT = 4;
export const SPIRIT_STRENGTHS = [
  { id: 'offense', label: 'Offense' },
  { id: 'control', label: 'Control' },
  { id: 'fear', label: 'Fear' },
  { id: 'defense', label: 'Defense' },
  { id: 'utility', label: 'Utility' },
] as const;

export type SpiritStrength = (typeof SPIRIT_STRENGTHS)[number]['id'];

export type HistoryFilter = 'neverPlayed' | 'outOfRotation' | 'goTos';

export interface SpiritHistory {
  playCounts: Map<string, number>;
  recentlyPlayed: Set<string>;
}

export interface ThemeOption {
  theme: (typeof SPIRIT_THEMES)[number];
  matchingPicks: number;
  availableCount: number;
}

export function summarizeSpiritHistory(plays: Play[]): SpiritHistory {
  const playCounts = new Map<string, number>();
  for (const play of plays) {
    for (const slug of play.spiritSlugs) {
      playCounts.set(slug, (playCounts.get(slug) ?? 0) + 1);
    }
  }

  const recentGames = [...plays]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, RECENT_GAME_COUNT);
  const recentlyPlayed = new Set(recentGames.flatMap((play) => play.spiritSlugs));
  return { playCounts, recentlyPlayed };
}

export function availableSpirits(
  spirits: Spirit[],
  pickedSlugs: string[],
  activeFilters: Set<HistoryFilter>,
  history: SpiritHistory,
  activeThemes: Set<SpiritThemeId> = new Set(),
  activeStrengths: Set<SpiritStrength> = new Set()
): Spirit[] {
  const picked = new Set(pickedSlugs);
  return spirits.filter((spirit) => {
    if (picked.has(spirit.slug)) return false;
    const playCount = history.playCounts.get(spirit.slug) ?? 0;
    if (activeFilters.has('neverPlayed') && playCount > 0) return false;
    if (activeFilters.has('outOfRotation') && history.recentlyPlayed.has(spirit.slug)) return false;
    if (activeFilters.has('goTos') && playCount < GO_TO_MINIMUM_PLAYS) return false;
    if ([...activeThemes].some((theme) => !spirit.themes.includes(theme))) return false;
    if (
      activeStrengths.size > 0 &&
      !strongestAttributes(spirit).some((strength) => activeStrengths.has(strength))
    )
      return false;
    return true;
  });
}

export function strongestAttributes(spirit: Spirit): SpiritStrength[] {
  const highestScore = Math.max(...SPIRIT_STRENGTHS.map((strength) => spirit[strength.id]));
  return SPIRIT_STRENGTHS.filter((strength) => spirit[strength.id] === highestScore).map(
    (strength) => strength.id
  );
}

export function getThemeOptions(
  pickedSpirits: Spirit[],
  basePool: Spirit[],
  activeThemes: Set<SpiritThemeId>
): ThemeOption[] {
  return SPIRIT_THEMES.map((theme) => {
    const matchingPicks = pickedSpirits.filter((spirit) => spirit.themes.includes(theme.id)).length;
    const requiredThemes = new Set([...activeThemes, theme.id]);
    const availableCount = basePool.filter((spirit) =>
      [...requiredThemes].every((required) => spirit.themes.includes(required))
    ).length;
    return { theme, matchingPicks, availableCount };
  }).sort(
    (first, second) =>
      second.matchingPicks - first.matchingPicks ||
      second.availableCount - first.availableCount ||
      first.theme.label.localeCompare(second.theme.label)
  );
}

export function themeStrengthLabel(matchingPicks: number, pickedCount: number): string {
  if (pickedCount === 1) return 'From your pick';
  if (matchingPicks === pickedCount) return 'All picks';
  if (matchingPicks === 1) return 'One pick';
  if (matchingPicks > pickedCount / 2) return 'Most picks';
  return `${matchingPicks} picks`;
}

export function dealShortlist(spirits: Spirit[], random: () => number = Math.random): string[] {
  const pool = [...spirits];
  const count = Math.min(SHORTLIST_SIZE, pool.length);
  for (let index = 0; index < count; index += 1) {
    const swapIndex = index + Math.floor(random() * (pool.length - index));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, count).map((spirit) => spirit.slug);
}
