import { getAllAdversaries, getAdversaryBySlug } from '~/models/Adversary';
import type { Play } from './types';

export const CALIBRATION_WINDOW = 3;
const DIFFICULTY_STEP = 1;
const allDifficulties = getAllAdversaries().flatMap((adversary) =>
  adversary.levels.map((level) => level.difficulty)
);
const MIN_DIFFICULTY = Math.min(...allDifficulties);
const MAX_DIFFICULTY = Math.max(...allDifficulties);

export interface DifficultySummary {
  difficulty: number;
  games: number;
  wins: number;
  easy: number;
  right: number;
  hard: number;
}

export interface Calibration {
  direction: 'insufficient' | 'raise' | 'lower' | 'hold';
  target: number | null;
  recentPlays: Play[];
}

export function difficultyForPlay(play: Play): number {
  const difficulty = getAdversaryBySlug(play.adversarySlug)?.levels.find(
    (level) => level.level === play.level
  )?.difficulty;
  if (difficulty === undefined) throw new Error(`Unknown adversary level in play ${play.id}`);
  return difficulty;
}

export function summarizeByDifficulty(plays: Play[]): DifficultySummary[] {
  const summaries = new Map<number, DifficultySummary>();
  for (const play of plays) {
    const difficulty = difficultyForPlay(play);
    const summary = summaries.get(difficulty) ?? {
      difficulty,
      games: 0,
      wins: 0,
      easy: 0,
      right: 0,
      hard: 0,
    };
    summary.games += 1;
    if (play.result === 'win') summary.wins += 1;
    summary[play.feltDifficulty] += 1;
    summaries.set(difficulty, summary);
  }
  return [...summaries.values()].sort((first, second) => first.difficulty - second.difficulty);
}

export function calibrateDifficulty(plays: Play[]): Calibration {
  const recentPlays = [...plays]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, CALIBRATION_WINDOW);
  if (recentPlays.length < CALIBRATION_WINDOW) {
    return { direction: 'insufficient', target: null, recentPlays };
  }

  const ratings = recentPlays.map(difficultyForPlay).sort((first, second) => first - second);
  const currentTarget = ratings[Math.floor(ratings.length / 2)];
  if (recentPlays.every((play) => play.result === 'win' && play.feltDifficulty === 'easy')) {
    return {
      direction: 'raise',
      target: Math.min(MAX_DIFFICULTY, currentTarget + DIFFICULTY_STEP),
      recentPlays,
    };
  }
  if (recentPlays.every((play) => play.result === 'loss' && play.feltDifficulty === 'hard')) {
    return {
      direction: 'lower',
      target: Math.max(MIN_DIFFICULTY, currentTarget - DIFFICULTY_STEP),
      recentPlays,
    };
  }
  return { direction: 'hold', target: currentTarget, recentPlays };
}
