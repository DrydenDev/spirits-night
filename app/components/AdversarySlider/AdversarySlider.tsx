import { Slider, Stack } from '@mui/material';
import { ADVERSARY_MIN_LEVEL, ADVERSARY_MAX_LEVEL, ADVERSARY_LEVEL_COUNT } from '~/constants/game';

interface AdversarySliderProps {
  level: number;
  onChange: (level: number) => void;
  onCommit: (level: number) => void;
}

export function AdversarySlider({ level, onChange, onCommit }: AdversarySliderProps) {
  const marks = Array.from({ length: ADVERSARY_LEVEL_COUNT }, (_, i) => ({
    value: i + ADVERSARY_MIN_LEVEL,
    label: i + ADVERSARY_MIN_LEVEL,
  }));

  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} spacing={1}>
      <Slider
        size="medium"
        aria-label="Adversary difficulty"
        value={level}
        valueLabelDisplay="auto"
        step={null}
        marks={marks}
        min={ADVERSARY_MIN_LEVEL}
        max={ADVERSARY_MAX_LEVEL}
        sx={{ width: { xs: '100%', md: '50%' } }}
        onChange={(_, value) => onChange(value as number)}
        onChangeCommitted={(_, value) => onCommit(value as number)}
      />
    </Stack>
  );
}
