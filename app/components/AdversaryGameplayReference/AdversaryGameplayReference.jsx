import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EscalationAlert, LossAlert } from '~/components/AdversaryAlerts';

import { toSpiritIslandText } from '~/utils/spiritIslandText';

const PHASE_ORDER = [
  "Setup",
  "Traits",
  "Spirit",
  "Fast",
  "Event",
  "Fear",
  "Invader",
  "Ravage",
  "Build",
  "Explore",
  "Slow",
  "Time Passes"
]

export function AdversaryGameplayReference({ adversary, level }) {
  const levelReferences = adversary.references.filter((ref) => {
    const atLevel = ref.level <= level;
    const levelExceeded = ref.maxLevel && level > ref.maxLevel;
    return atLevel && !levelExceeded;
  });

  const phaseMarkup = PHASE_ORDER.map((phase) => <PhaseAccordion key={phase} references={levelReferences} phase={phase} />);

  return (
    <Paper elevation={2} className="adversary-card">
      <Stack direction="column" spacing={2}>
        {phaseMarkup}
      </Stack>
    </Paper>
  );
}

function PhaseAccordion({references, phase}) {
  const [hideAccordion, setHideAccordion] = useState(false);
  if (hideAccordion) return null;

  const phaseReferences = references.filter((ref) => ref.phase.toUpperCase() === phase.toUpperCase());
  if (!phaseReferences.length) return null;

  const phaseLossConditionMarkup = phaseReferences.map((ref) => {
    if (ref.type !== "Loss Condition") return null;

    return (
      <LossAlert title={ref.title} description={ref.description} />
    );
  })

  const phaseEscalationMarkup = phaseReferences.map((ref) => {
    if (ref.type !== "Escalation") return null;

    return (
      <EscalationAlert title={ref.title} description={ref.description} />
    );
  })

  const phaseAbilityMarkup = (
    <List>
      {
        phaseReferences.map((ref, index) => {
          if (ref.type === "Escalation" || ref.type === "Loss Condition") return null;

          return (
            <ListItem key={index}>
              <ListItemText
                key={index}
                primary={ref.title}
                secondary={toSpiritIslandText(ref.description)}
              />
            </ListItem>
          );
        })
      }
    </List>
  );

  return (
    <Accordion defaultExpanded={true}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{backgroundColor: "#ebf2f6"}}
      >
        <Typography variant="h6" as="h3">{phase}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {phaseLossConditionMarkup}
        {phaseEscalationMarkup}
        {phaseAbilityMarkup}
        <DismissButton phase={phase} onClick={() => setHideAccordion(true) } />
      </AccordionDetails>
    </Accordion>
  );
}

function DismissButton({ phase, onClick }) {
  const isSetup = phase.toUpperCase() === "SETUP";
  if (!isSetup) return null;
  
  return (
    <Box textAlign="center">
      <Button 
        color="primary" 
        size="medium" 
        variant="contained" 
        startIcon={<CloseIcon />}
        onClick={onClick}
      >
        Dismiss Setup
      </Button>
    </Box>
  );
}