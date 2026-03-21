import { Link, Stack } from '@mui/material';
import { Link as RemixLink } from '@remix-run/react';
import { toSpiritIslandText } from '~/utils/spiritIslandText';

export function TopNav() {
  return (
    <Stack
      sx={{ justifyContent: 'space-around', alignItems: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      className="root-nav"
    >
      <Link underline="none" component={RemixLink} to="/adversary" prefetch="render">
        {toSpiritIslandText('[[Explorer]]')} Adversaries
      </Link>
      <Link underline="none" component={RemixLink} to="/spirit" prefetch="render">
        {toSpiritIslandText('[[Presence]]')} Spirits
      </Link>
    </Stack>
  );
}
