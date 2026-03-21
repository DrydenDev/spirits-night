import { Chip, Stack } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { DIFFICULTY_WARNING_THRESHOLD, DIFFICULTY_ERROR_THRESHOLD } from '~/constants/game';
import type { Adversary } from '~/types/domain';

interface AdversaryTagBarProps {
  adversary: Adversary;
  level: number;
}

export function AdversaryTagBar({ adversary, level }: AdversaryTagBarProps) {
  const difficulty = adversary.levels.find(
    (adversaryLevel) => adversaryLevel.level === level
  )?.difficulty;

  return (
    <Stack sx={{ justifyContent: 'center' }} direction="row" spacing={1}>
      <LevelChip level={level} />
      <DifficultyChip difficulty={difficulty} />
      <Chip label={adversary.expansion} />
    </Stack>
  );
}

function LevelChip({ level }: { level: number }) {
  return <Chip color="primary" label={`Level ${level}`} />;
}

function DifficultyChip({ difficulty }: { difficulty: number | undefined }) {
  if (!difficulty) return null;

  const dangerColor: ChipProps['color'] =
    difficulty > DIFFICULTY_ERROR_THRESHOLD
      ? 'error'
      : difficulty > DIFFICULTY_WARNING_THRESHOLD
        ? 'warning'
        : 'success';

  return <Chip color={dangerColor} variant="filled" label={`Difficulty ${difficulty}`} />;
}
