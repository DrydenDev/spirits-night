import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EscalationAlert, LossAlert } from '~/components/AdversaryAlerts';
import { toSpiritIslandText } from '~/utils/spiritIslandText';
import type { Adversary, AdversaryReference } from '~/types/domain';

const PHASE_ORDER = [
  'Setup',
  'Traits',
  'Spirit',
  'Fast',
  'Event',
  'Fear',
  'Invader',
  'Ravage',
  'Build',
  'Explore',
  'Slow',
  'Time Passes',
] as const;

interface AdversaryGameplayReferenceProps {
  adversary: Adversary;
  level: number;
}

export function AdversaryGameplayReference({ adversary, level }: AdversaryGameplayReferenceProps) {
  const levelReferences = adversary.references.filter((ref) => {
    const atLevel = ref.level <= level;
    const levelExceeded = ref.maxLevel !== null && level > ref.maxLevel;
    return atLevel && !levelExceeded;
  });

  return (
    <Paper elevation={2} className="adversary-card">
      <Stack direction="column" spacing={2}>
        {PHASE_ORDER.map((phase) => (
          <PhaseAccordion key={phase} references={levelReferences} phase={phase} />
        ))}
      </Stack>
    </Paper>
  );
}

interface PhaseAccordionProps {
  references: AdversaryReference[];
  phase: string;
}

function PhaseAccordion({ references, phase }: PhaseAccordionProps) {
  const [hideAccordion, setHideAccordion] = useState(false);
  if (hideAccordion) return null;

  const phaseReferences = references.filter(
    (ref) => ref.phase.toUpperCase() === phase.toUpperCase()
  );
  if (!phaseReferences.length) return null;

  const phaseLossConditionMarkup = phaseReferences.map((ref) => {
    if (ref.type !== 'Loss Condition') return null;
    return <LossAlert key={ref.id} title={ref.title} description={ref.description} />;
  });

  const phaseEscalationMarkup = phaseReferences.map((ref) => {
    if (ref.type !== 'Escalation') return null;
    return <EscalationAlert key={ref.id} title={ref.title} description={ref.description} />;
  });

  const phaseAbilityMarkup = (
    <List>
      {phaseReferences.map((ref) => {
        if (ref.type === 'Escalation' || ref.type === 'Loss Condition') return null;
        return (
          <ListItem key={ref.id}>
            <ListItemText primary={ref.title} secondary={toSpiritIslandText(ref.description)} />
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#ebf2f6' }}>
        <Typography variant="h6" component="h3">
          {phase}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {phaseLossConditionMarkup}
        {phaseEscalationMarkup}
        {phaseAbilityMarkup}
        <DismissButton phase={phase} onClick={() => setHideAccordion(true)} />
      </AccordionDetails>
    </Accordion>
  );
}

interface DismissButtonProps {
  phase: string;
  onClick: () => void;
}

function DismissButton({ phase, onClick }: DismissButtonProps) {
  if (phase.toUpperCase() !== 'SETUP') return null;
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
