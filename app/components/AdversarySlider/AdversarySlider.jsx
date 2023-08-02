import { 
  Slider,
  Stack,
} from "@mui/material";

export function AdversarySlider({ level, onChange, onCommit }) {
  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} spacing={1}>
      <Slider
        size="medium"
        aria-label="Adversary difficulty"
        value={level}
        valueLabelDisplay="auto"
        step={null}
        marks={[...Array(7).keys()].map((markLevel) => ({ value: markLevel, label: markLevel }))}
        min={0}
        max={6}
        sx={{ width: {xs: "100%", md:  "50%" }}}
        onChange={(event, level) => onChange(level)}
        onChangeCommitted={(event, level) => onCommit(level)}
      />
    </Stack>
  );
}