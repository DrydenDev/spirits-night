import { 
  Alert,
  AlertTitle,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { EscalationAlert, LossAlert } from '~/components/AdversaryAlerts';

import { toSpiritIslandText } from '~/utils/spiritIslandText';

function getDifficultyLevel(adversary, level) {
  return adversary.levels.find((adversaryLevel) => adversaryLevel.level === level);
}

export function AdversaryCard({adversary, level}) {
  const { lossCondition, escalationAbility, levels } = adversary;
  const difficultyLevel = getDifficultyLevel(adversary, level);
  const lossConditionMarkup = !lossCondition ? null : (
    <LossAlert title={lossCondition.title} description={lossCondition.description} />
  );

  const escalationMarkup = <EscalationAlert title={escalationAbility.title} description={escalationAbility.description} />;

  const fearMarkup = (
    <Stack direction="column" className="fear-card" spacing={0}>
      <Box className="header-bar"><Typography variant="h4">Fear Cards</Typography></Box>
      <Box className="body-text"><Typography variant="body1">{difficultyLevel?.fearCards || "3/3/3"}</Typography></Box>
    </Stack>
  );

  const levelItems = levels.map((levelRow, index) => {
    if (levelRow.level > level) return;
    return (
      <ListItem key={index}>
        <ListItemText
          key={index}
          primary={levelRow.title}
          secondary={toSpiritIslandText(levelRow.description)}
        />
      </ListItem>
    )
  });
  const levelsMarkup = levelItems.length > 0 ? (
    <List>{levelItems}</List>
  ) : null;

  return (
    <Paper elevation={2} className="adversary-card">
      <Stack direction="column" spacing={2}>
        {lossConditionMarkup}
        {escalationMarkup}
        {fearMarkup}
        {levelsMarkup}
      </Stack>
    </Paper>
  );
}