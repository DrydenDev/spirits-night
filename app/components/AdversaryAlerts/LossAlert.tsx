import { Alert, AlertTitle } from '@mui/material';
import { toSpiritIslandText } from '~/utils/spiritIslandText';

interface LossAlertProps {
  title: string;
  description: string;
}

export function LossAlert({ title, description }: LossAlertProps) {
  return (
    <Alert severity="error">
      <AlertTitle>Additional Loss Condition</AlertTitle>
      <strong>{title}</strong>: {toSpiritIslandText(description)}
    </Alert>
  );
}
