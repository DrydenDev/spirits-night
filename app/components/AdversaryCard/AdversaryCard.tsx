import { Box, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { EscalationAlert, LossAlert } from '~/components/AdversaryAlerts';
import { toSpiritIslandText } from '~/utils/spiritIslandText';
import type { Adversary, AdversaryLevel } from '~/types/domain';

interface AdversaryCardProps {
  adversary: Adversary;
  level: number;
}

function getDifficultyLevel(adversary: Adversary, level: number): AdversaryLevel | undefined {
  return adversary.levels.find((adversaryLevel) => adversaryLevel.level === level);
}

export function AdversaryCard({ adversary, level }: AdversaryCardProps) {
  const { lossCondition, escalationAbility, levels } = adversary;
  const difficultyLevel = getDifficultyLevel(adversary, level);

  const lossConditionMarkup = !lossCondition ? null : (
    <LossAlert title={lossCondition.title} description={lossCondition.description} />
  );

  const escalationMarkup = (
    <EscalationAlert title={escalationAbility.title} description={escalationAbility.description} />
  );

  const fearMarkup = (
    <Stack direction="column" className="fear-card" spacing={0}>
      <Box className="header-bar">
        <Typography variant="h4">Fear Cards</Typography>
      </Box>
      <Box className="body-text">
        <Typography variant="body1">{difficultyLevel?.fearCards ?? '3/3/3'}</Typography>
      </Box>
    </Stack>
  );

  const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
  const levelItems = sortedLevels.map((levelRow) => {
    if (levelRow.level > level) return null;
    return (
      <ListItem key={levelRow.id}>
        <ListItemText
          primary={levelRow.title}
          secondary={toSpiritIslandText(levelRow.description)}
        />
      </ListItem>
    );
  });

  return (
    <Paper elevation={2} className="adversary-card">
      <Stack direction="column" spacing={2}>
        {lossConditionMarkup}
        {escalationMarkup}
        {fearMarkup}
        {levelItems.some(Boolean) && <List>{levelItems}</List>}
      </Stack>
    </Paper>
  );
}
