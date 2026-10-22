import { describe, expect, it } from 'vitest';
import type { Play } from '~/features/plays/types';
import { getAllSpirits } from '~/models/Spirit';
import {
  availableSpirits,
  dealShortlist,
  GO_TO_MINIMUM_PLAYS,
  RECENT_GAME_COUNT,
  SHORTLIST_SIZE,
  summarizeSpiritHistory,
} from './picker';

const spirits = getAllSpirits();

function play(date: string, spiritSlugs: string[]): Play {
  return {
    id: date,
    date,
    adversarySlug: 'england',
    level: 1,
    spiritSlugs,
    playerCount: spiritSlugs.length,
    result: 'win',
    feltDifficulty: 'right',
  };
}

describe('Spirit picker', () => {
  it('counts every played Spirit and uses the latest games for rotation', () => {
    const plays = [
      play('2026-01-01', ['river']),
      ...Array.from({ length: RECENT_GAME_COUNT }, (_, index) =>
        play(`2026-01-${String(index + 2).padStart(2, '0')}`, ['earthquakes'])
      ),
      play('2026-01-10', ['river', 'earthquakes']),
    ];
    const history = summarizeSpiritHistory(plays);
    expect(history.playCounts.get('river')).toBe(2);
    expect(history.playCounts.get('earthquakes')).toBe(RECENT_GAME_COUNT + 1);
    expect(history.recentlyPlayed.has('river')).toBe(true);
    expect(history.recentlyPlayed.has('earthquakes')).toBe(true);
  });

  it('keeps Spirits from older games out of the recent rotation', () => {
    const plays = [
      play('2026-01-01', ['river']),
      ...Array.from({ length: RECENT_GAME_COUNT }, (_, index) =>
        play(`2026-01-${String(index + 2).padStart(2, '0')}`, ['earthquakes'])
      ),
    ];
    const history = summarizeSpiritHistory(plays);
    expect(history.recentlyPlayed.has('river')).toBe(false);
    expect(history.playCounts.get('river')).toBe(1);
  });

  it('combines history filters and excludes Spirits already picked', () => {
    const history = summarizeSpiritHistory([
      play('2026-01-01', ['river']),
      play('2026-01-02', ['river', 'earthquakes']),
    ]);
    expect(
      availableSpirits(spirits, [], new Set(['goTos']), history).map((spirit) => spirit.slug)
    ).toEqual(['river']);
    expect(availableSpirits(spirits, [], new Set(['goTos', 'neverPlayed']), history)).toEqual([]);
    expect(
      availableSpirits(spirits, ['river'], new Set(), history).some(
        (spirit) => spirit.slug === 'river'
      )
    ).toBe(false);
    expect(
      availableSpirits(spirits, [], new Set(['outOfRotation']), history).some(
        (spirit) => spirit.slug === 'earthquakes'
      )
    ).toBe(false);
    expect(GO_TO_MINIMUM_PLAYS).toBe(2);
  });

  it('deals unique Spirits from the eligible pool without changing their order', () => {
    const eligible = spirits.slice(0, SHORTLIST_SIZE + 2);
    const originalOrder = eligible.map((spirit) => spirit.slug);
    const shortlist = dealShortlist(eligible, () => 0.99);
    expect(shortlist).toHaveLength(SHORTLIST_SIZE);
    expect(new Set(shortlist).size).toBe(SHORTLIST_SIZE);
    expect(shortlist.every((slug) => originalOrder.includes(slug))).toBe(true);
    expect(eligible.map((spirit) => spirit.slug)).toEqual(originalOrder);
    expect(dealShortlist(eligible.slice(0, 2), () => 0)).toHaveLength(2);
  });
});
