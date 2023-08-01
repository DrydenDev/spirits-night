import { useState } from 'react';
import { 
  IconButton,
  Snackbar,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export function useStatusSnackbar() {
  const [snackbarState, setSnackbarState] = useState({ open: false });
  const closeSnackbar = () => setSnackbarState({open: false});
  const openSnackbar = (text) => {
    setSnackbarState({text, open: true});
  };

  return {
    openSnackbar,
    closeSnackbar,
    open: snackbarState?.open || false,
    text: snackbarState?.text  ||  "",
  };
}

export function StatusSnackbar({ open, text, onClose }) {
  return (
    <Snackbar
    open={open}
    autoHideDuration={1500}
    onClose={onClose}
    message={text}
    anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
    action={
      <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
    }
  />
  );
}