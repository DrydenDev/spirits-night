import {
  Alert,
  AlertTitle,
} from "@mui/material";

import { toSpiritIslandText } from '~/utils/spiritIslandText';

export function LossAlert({ title, description }) {
  return (
    <Alert severity="error">
      <AlertTitle>Additional Loss Condition</AlertTitle>
      <strong>{title}</strong>: {toSpiritIslandText(description)}
    </Alert>
  );
}