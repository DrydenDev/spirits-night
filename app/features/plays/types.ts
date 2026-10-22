export type GameResult = 'win' | 'loss';
export type FeltDifficulty = 'easy' | 'right' | 'hard';

export interface PlayInput {
  date: string;
  adversarySlug: string;
  level: number;
  spiritSlugs: string[];
  playerCount: number;
  result: GameResult;
  feltDifficulty: FeltDifficulty;
}

export interface Play extends PlayInput {
  id: string;
}

export type PlayResult<T> = { ok: true; value: T } | { ok: false; message: string };
