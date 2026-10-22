import { describe, expect, it } from 'vitest';
import type { Play } from './types';
import { calibrateDifficulty, difficultyForPlay, summarizeByDifficulty } from './summary';

function play(
  id: string,
  date: string,
  result: Play['result'],
  feltDifficulty: Play['feltDifficulty']
): Play {
  return {
    id,
    date,
    adversarySlug: 'england',
    level: 4,
    spiritSlugs: ['river'],
    playerCount: 1,
    result,
    feltDifficulty,
  };
}

describe('difficulty calibration', () => {
  it('summarizes outcomes at the adversary difficulty rating with sample counts', () => {
    const games = [play('a', '2026-10-19', 'win', 'easy'), play('b', '2026-10-20', 'loss', 'hard')];
    const difficulty = difficultyForPlay(games[0]);
    expect(summarizeByDifficulty(games)).toEqual([
      { difficulty, games: 2, wins: 1, easy: 1, right: 0, hard: 1 },
    ]);
  });

  it('waits for three games before suggesting a target', () => {
    expect(calibrateDifficulty([play('a', '2026-10-19', 'win', 'easy')])).toMatchObject({
      direction: 'insufficient',
      target: null,
    });
  });

  it('raises only after three recent easy wins, and lowers after three hard losses', () => {
    const easyWins = [19, 20, 21].map((day) => play(String(day), `2026-10-${day}`, 'win', 'easy'));
    const difficulty = difficultyForPlay(easyWins[0]);
    expect(calibrateDifficulty(easyWins)).toMatchObject({
      direction: 'raise',
      target: difficulty + 1,
    });
    const hardLosses = easyWins.map((game) => ({
      ...game,
      result: 'loss' as const,
      feltDifficulty: 'hard' as const,
    }));
    expect(calibrateDifficulty(hardLosses)).toMatchObject({
      direction: 'lower',
      target: difficulty - 1,
    });
    expect(calibrateDifficulty([easyWins[0], ...hardLosses.slice(1)])).toMatchObject({
      direction: 'hold',
      target: difficulty,
    });
  });

  it('bases the suggestion on the three most recent dates', () => {
    const olderLoss = play('old', '2026-10-01', 'loss', 'hard');
    const easyWins = [19, 20, 21].map((day) => play(String(day), `2026-10-${day}`, 'win', 'easy'));
    expect(calibrateDifficulty([olderLoss, ...easyWins]).direction).toBe('raise');
  });
});
