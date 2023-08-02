import {
  Alert,
  AlertTitle,
} from "@mui/material";

import { toSpiritIslandText } from '~/utils/spiritIslandText';

export function EscalationAlert({ title, description }) {
  return (
    <Alert severity="warning">
      <AlertTitle>Escalation</AlertTitle>
      <strong>{title}</strong>: {toSpiritIslandText(description)}
    </Alert>
  );
}