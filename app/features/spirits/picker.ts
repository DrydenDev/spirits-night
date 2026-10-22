import type { Play } from '~/features/plays/types';
import type { Spirit } from '~/types/domain';

export const RECENT_GAME_COUNT = 5;
export const SHORTLIST_SIZE = 5;
export const GO_TO_MINIMUM_PLAYS = 2;

export type HistoryFilter = 'neverPlayed' | 'outOfRotation' | 'goTos';

export interface SpiritHistory {
  playCounts: Map<string, number>;
  recentlyPlayed: Set<string>;
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
  history: SpiritHistory
): Spirit[] {
  const picked = new Set(pickedSlugs);
  return spirits.filter((spirit) => {
    if (picked.has(spirit.slug)) return false;
    const playCount = history.playCounts.get(spirit.slug) ?? 0;
    if (activeFilters.has('neverPlayed') && playCount > 0) return false;
    if (activeFilters.has('outOfRotation') && history.recentlyPlayed.has(spirit.slug)) return false;
    if (activeFilters.has('goTos') && playCount < GO_TO_MINIMUM_PLAYS) return false;
    return true;
  });
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
