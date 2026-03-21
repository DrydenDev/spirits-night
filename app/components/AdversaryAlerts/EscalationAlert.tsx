import { Alert, AlertTitle } from '@mui/material';
import { toSpiritIslandText } from '~/utils/spiritIslandText';

interface EscalationAlertProps {
  title: string;
  description: string;
}

export function EscalationAlert({ title, description }: EscalationAlertProps) {
  return (
    <Alert severity="warning">
      <AlertTitle>Escalation</AlertTitle>
      <strong>{title}</strong>: {toSpiritIslandText(description)}
    </Alert>
  );
}
