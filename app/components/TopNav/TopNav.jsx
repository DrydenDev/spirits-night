import { Link, Stack } from "@mui/material";
import RowingIcon from '@mui/icons-material/Rowing';
import WhatshotIcon from '@mui/icons-material/Whatshot';

export function TopNav() {
  return (
    <Stack sx={{ justifyContent: 'space-around' }} direction={{ xs: 'column', sm: 'row' }} className="root-nav">
      <Link href="/adversary" underline="none"><RowingIcon color="primary" sx={{ fontSize: '1rem' }} /> Adversaries</Link>
      <Link href="/spirit" underline="none"><WhatshotIcon color="primary" sx={{ fontSize: '1rem' }} /> Spirits</Link>
    </Stack>
  );
}