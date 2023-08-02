import { 
  Box,
  Button,
  Card,
  CardActions, 
  CardMedia, 
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

export function AdversaryTagBar({ adversary, level }) {
  const difficulty = adversary.levels.find((adversaryLevel) => adversaryLevel.level === level)?.difficulty;

  return (
    <Stack sx={{ justifyContent: 'center' }} direction="row" spacing={1}>
      <LevelChip level={level} />
      <DifficultyChip difficulty={difficulty} />
      <Chip label={adversary.expansion} />
    </Stack>
  );
}

function LevelChip({ level }) {
  return <Chip color="primary" label={`Level ${level}`} />;
}

function DifficultyChip({ difficulty }) {
  const dangerColor = difficulty > 7 ? "error" : difficulty > 4 ? "warning" : "success";
  if (!difficulty) return null;

  return <Chip color={dangerColor} variant="filled" label={`Difficulty ${difficulty}`}/>;
}