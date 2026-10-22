import { describe, expect, it } from 'vitest';
import type { Play } from '~/features/plays/types';
import { getAllSpirits } from '~/models/Spirit';
import {
  availableSpirits,
  dealShortlist,
  GO_TO_MINIMUM_PLAYS,
  getThemeOptions,
  RECENT_GAME_COUNT,
  SHORTLIST_SIZE,
  strongestAttributes,
  summarizeSpiritHistory,
  themeStrengthLabel,
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

  it('combines theme filters with the existing pool', () => {
    const history = summarizeSpiritHistory([]);
    const filtered = availableSpirits(
      spirits,
      ['volcano'],
      new Set(),
      history,
      new Set(['fire', 'earth'])
    );
    expect(filtered.map((spirit) => spirit.slug)).toEqual(['heat-dragon']);
  });

  it('classifies tied top scores in every matching strength and combines strength choices as alternatives', () => {
    const tied = {
      ...spirits[0],
      offense: 5,
      control: 5,
      fear: 2,
      defense: 3,
      utility: 4,
    };
    expect(strongestAttributes(tied)).toEqual(['offense', 'control']);
    const filtered = availableSpirits(
      [tied, { ...spirits[1], offense: 1, control: 1, fear: 5, defense: 2, utility: 2 }],
      [],
      new Set(),
      summarizeSpiritHistory([]),
      new Set(),
      new Set(['offense', 'control'])
    );
    expect(filtered).toEqual([tied]);
  });

  it('ranks themes by lineup overlap and counts candidates under active themes', () => {
    const picked = spirits.filter((spirit) =>
      ['wildfire', 'lightning', 'volcano'].includes(spirit.slug)
    );
    const pool = spirits.filter((spirit) => !picked.includes(spirit));
    const options = getThemeOptions(picked, pool, new Set(['fire']));
    const fire = options.find((option) => option.theme.id === 'fire')!;
    const earth = options.find((option) => option.theme.id === 'earth')!;
    const wind = options.find((option) => option.theme.id === 'wind')!;
    expect(fire.matchingPicks).toBe(3);
    expect(earth.matchingPicks).toBe(1);
    expect(earth.availableCount).toBe(1);
    expect(wind.availableCount).toBe(0);
    expect(options[0].matchingPicks).toBe(3);
    expect(options.indexOf(fire)).toBeLessThan(options.indexOf(earth));
  });

  it('describes all, most, and one-pick theme strength', () => {
    expect(themeStrengthLabel(1, 1)).toBe('From your pick');
    expect(themeStrengthLabel(3, 3)).toBe('All picks');
    expect(themeStrengthLabel(2, 3)).toBe('Most picks');
    expect(themeStrengthLabel(1, 3)).toBe('One pick');
  });
});
