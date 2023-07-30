import { Link, Stack } from "@mui/material";
import { toSpiritIslandText } from "~/utils/spiritIslandText";

export function TopNav() {
  return (
    <Stack sx={{ justifyContent: 'space-around', alignItems: 'center' }} direction={{ xs: 'column', sm: 'row' }} spacing={1} className="root-nav">
      <Link href="/adversary" underline="none">{toSpiritIslandText('[[Explorer]]')} Adversaries</Link>
      <Link href="/spirit" underline="none">{toSpiritIslandText('[[Presence]]')} Spirits</Link>
    </Stack>
  );
}