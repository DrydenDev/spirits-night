import { describe, expect, it } from 'vitest';
import { communityAdversaries } from './communityAdversaries';
import { getAdversaryBySlug, getRandomAdversary } from '~/models/Adversary';
import { referencesAtLevel } from './reference';

describe('community adversary rules', () => {
  it('provides source attribution and a playable level ladder for each design', () => {
    expect(communityAdversaries.map((entry) => entry.slug)).toEqual([
      'nestene-invasion',
      'principality-of-monaco',
      'dutch-east-india-company',
      'papal-states',
      'denmark-norway',
      'horde-of-zombies',
      'ottoman-empire',
      'byzantine-empire',
      'dutch-republic',
      'mongol-empire',
    ]);

    for (const entry of communityAdversaries) {
      expect(getAdversaryBySlug(entry.slug)).toEqual(entry);
      expect(entry.creator).toBeTruthy();
      expect(entry.sourceUrl).toMatch(/^https:\/\//);
      if (entry.discussionUrl) expect(entry.discussionUrl).toMatch(/^https:\/\//);
      expect(entry.playtestConfidence).toMatch(/^(more|some|limited)$/);
      expect(entry.playtestEvidence).toBeTruthy();
      expect(entry.impressions).toBeTruthy();
      expect(entry.balanceNote).toBeTruthy();
      expect(entry.levels.map((level) => level.level)).toEqual(
        Array.from({ length: entry.levels.length }, (_, index) => index + 1)
      );
      expect(entry.references.length).toBeGreaterThan(entry.levels.length);
    }
  });

  it('includes Nestene special rules at every level and only active level effects', () => {
    const nestene = getAdversaryBySlug('nestene-invasion')!;
    expect(nestene.specialRules?.[0].description).toContain('Spirits cannot win');
    expect(referencesAtLevel(nestene.references, 2).map((rule) => rule.title)).toContain(
      'Crown Consciousness'
    );
    expect(referencesAtLevel(nestene.references, 2).map((rule) => rule.title)).not.toContain(
      'Staggered Fleets'
    );
    expect(nestene.levels.at(-1)?.difficulty).toBe(9);
  });

  it('preserves Monaco level 7 without affecting official daily picks', () => {
    const monaco = getAdversaryBySlug('principality-of-monaco')!;
    expect(monaco.levels.find((level) => level.level === 6)?.fearCards).toBe('4/5/6');
    expect(monaco.levels.at(-1)).toMatchObject({ level: 7, title: 'Surge of Interest' });
    expect(getRandomAdversary('10/21/2026').adversary.slug).toBe('sweden');
  });

  it('keeps the collection card versions and reported balance notes with their rules', () => {
    const dutch = getAdversaryBySlug('dutch-east-india-company')!;
    const papal = getAdversaryBySlug('papal-states')!;
    const denmark = getAdversaryBySlug('denmark-norway')!;

    expect(dutch.sourceUrl).toBe('https://boardgamegeek.com/image/7173405');
    expect(dutch.levels.at(-1)).toMatchObject({ level: 6, fearCards: '5/5/4' });
    expect(papal.sourceUrl).toBe('https://boardgamegeek.com/image/7173410');
    expect(papal.playtestEvidence).toContain('easier than expected');
    expect(papal.lossCondition?.description).toContain('Spirit Actions');
    expect(denmark.sourceUrl).toBe('https://boardgamegeek.com/image/7173406');
    expect(denmark.levels.at(-1)?.description).toContain('5/8/12');
  });

  it('keeps the zombie card experimental and its play notes separate from printed rules', () => {
    const zombies = getAdversaryBySlug('horde-of-zombies')!;
    expect(zombies.playtestConfidence).toBe('limited');
    expect(zombies.playtestEvidence).toContain('rebalanced');
    expect(zombies.playNotes).toHaveLength(3);
    expect(zombies.levels.find((level) => level.level === 2)?.description).toContain(
      'After a land Ravages'
    );
    expect(zombies.levels.find((level) => level.level === 5)?.description).toContain('II-L-II-II');
  });

  it('includes the Ottoman loss condition, level rules, and source card', () => {
    const ottoman = getAdversaryBySlug('ottoman-empire')!;
    expect(ottoman.sourceUrl).toBe('https://boardgamegeek.com/image/7173409');
    expect(ottoman.lossCondition?.description).toContain('all lands on a single board');
    expect(ottoman.levels.find((level) => level.level === 2)?.description).toContain(
      'Add 1 [[Strife]]'
    );
    expect(ottoman.levels.find((level) => level.level === 3)?.description).toContain(
      'until there are 5 [[Explorer]]'
    );
    expect(ottoman.levels.at(-1)).toMatchObject({ difficulty: 10, fearCards: '5/4/4' });
    expect(ottoman.playNotes?.[0]).toContain('without specifying a target');
  });

  it('includes Byzantine fortification rules and a note on the unresolved timing', () => {
    const byzantine = getAdversaryBySlug('byzantine-empire')!;
    expect(byzantine.sourceUrl).toBe('https://boardgamegeek.com/image/7173384');
    expect(byzantine.levels.find((level) => level.level === 1)?.description).toContain(
      'after a [[City]] is Destroyed'
    );
    expect(byzantine.levels.find((level) => level.level === 3)?.description).toContain(
      'instead deal 3 Damage'
    );
    expect(byzantine.levels.at(-1)?.description).toContain('instead deal 2 Damage');
    expect(byzantine.playNotes?.[0]).toContain('No creator clarification was found');
  });

  it('includes Dutch Republic ocean, Event, and corrected setup rules', () => {
    const dutchRepublic = getAdversaryBySlug('dutch-republic')!;
    expect(dutchRepublic.sourceUrl).toContain('/wur0sx/');
    expect(dutchRepublic.levels.find((level) => level.level === 1)?.description).toContain(
      'Ocean (land #0)'
    );
    expect(dutchRepublic.levels.find((level) => level.level === 2)?.description).toContain(
      'Plague Epidemic'
    );
    expect(dutchRepublic.levels.find((level) => level.level === 3)?.description).toContain(
      'on each board'
    );
    expect(dutchRepublic.playNotes).toHaveLength(3);
  });

  it('includes Mongol Warlord mechanics, deck order, and difficulty warning', () => {
    const mongol = getAdversaryBySlug('mongol-empire')!;
    expect(mongol.sourceUrl).toBe('https://i.redd.it/bc3c4ukq40k91.png');
    expect(mongol.specialRules?.[0].description).toContain('4 Health');
    expect(mongol.lossCondition?.description).toContain('during Time Passes');
    expect(mongol.levels.find((level) => level.level === 3)?.description).toContain(
      'I-I-I / II-III-II-III-II-III-II-III-III'
    );
    expect(mongol.levels.at(-1)).toMatchObject({ difficulty: 12, fearCards: '4/5/6' });
    expect(mongol.balanceNote).toContain('levels 5–6');
  });
});
