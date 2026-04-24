import { DIFFICULTY_WARNING_THRESHOLD, DIFFICULTY_ERROR_THRESHOLD } from '~/constants/game';
import type { Adversary } from '~/types/domain';

interface AdversaryTagBarProps {
  adversary: Adversary;
  level: number;
}

const chip = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-display tracking-wide border';

export function AdversaryTagBar({ adversary, level }: AdversaryTagBarProps) {
  const difficulty = adversary.levels.find((l) => l.level === level)?.difficulty;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <span className={`${chip} bg-teal-900/30 border-teal-600/40 text-teal-300`}>
        Level {level}
      </span>
      {difficulty !== undefined && <DifficultyChip difficulty={difficulty} />}
      <span className={`${chip} bg-depth-700 border-depth-500 text-slate-400`}>
        {adversary.expansion}
      </span>
    </div>
  );
}

function DifficultyChip({ difficulty }: { difficulty: number }) {
  const color =
    difficulty > DIFFICULTY_ERROR_THRESHOLD
      ? 'bg-red-900/30 border-red-500/40 text-red-300'
      : difficulty > DIFFICULTY_WARNING_THRESHOLD
        ? 'bg-amber-900/30 border-amber-500/40 text-amber-300'
        : 'bg-green-900/30 border-green-600/40 text-green-300';

  return (
    <span className={`${chip} ${color}`}>Difficulty {difficulty}</span>
  );
}
