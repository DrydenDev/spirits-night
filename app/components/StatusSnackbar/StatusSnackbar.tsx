import { useState } from 'react';
import { IconButton, Snackbar } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface SnackbarState {
  open: boolean;
  text?: string;
}

export function useStatusSnackbar() {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({ open: false });

  const closeSnackbar = () => setSnackbarState({ open: false });
  const openSnackbar = (text: string) => setSnackbarState({ text, open: true });

  return {
    openSnackbar,
    closeSnackbar,
    open: snackbarState.open,
    text: snackbarState.text ?? '',
  };
}

interface StatusSnackbarProps {
  open: boolean;
  text: string;
  onClose: () => void;
}

export function StatusSnackbar({ open, text, onClose }: StatusSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={1500}
      onClose={onClose}
      message={text}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      action={
        <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
}
