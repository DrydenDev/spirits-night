import { Fragment, useMemo } from 'react';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import TodayIcon from '@mui/icons-material/Today';
import { getAllSpirits } from '~/models/Spirit.server';
import type { Spirit } from '~/types/domain';

export const meta = () => [
  { name: 'title', content: 'Spirits' },
  { name: 'description', content: 'List of all Spirit Island Spirits' },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: 'Spirits' },
  { property: 'og:description', content: 'List of Spirit Island Spirits' },
  { property: 'og:image', content: '/images/spirits/spirits_splash.png' },
];

export async function loader() {
  const spirits = await getAllSpirits();
  return json({ spirits });
}

export default function SpiritIndex() {
  const { spirits } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <Card square>
        <CardMedia
          sx={{ height: 140 }}
          image="/images/spirits/spirits_splash.png"
          title="Spirit Island Spirits"
        />
        <CardContent className="spirit-list">
          <Stack direction="column" spacing={2}>
            <Typography align="center" variant="h3">
              Spirits
            </Typography>
            <SpiritList spirits={spirits} />
          </Stack>
        </CardContent>
      </Card>
      <BottomNavigation
        showLabels
        onChange={(_, selectedValue) => navigate(`/spirit/${selectedValue}`)}
      >
        <BottomNavigationAction label="Random" value="random" icon={<CasinoIcon />} />
        <BottomNavigationAction label="Today" value="today" icon={<TodayIcon />} />
      </BottomNavigation>
    </>
  );
}

function SpiritList({ spirits }: { spirits: Spirit[] }) {
  const sortedSpirits = useMemo(
    () => [...spirits].sort((a, b) => a.name.localeCompare(b.name)),
    [spirits]
  );

  return (
    <List>
      {sortedSpirits.map((spirit, index) => (
        <Fragment key={spirit.id}>
          {index > 0 && <Divider variant="inset" component="li" />}
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar
                alt={spirit.name}
                src={`/images/spirits/${spirit.slug}/splash.png`}
                sx={{ width: 56, height: 56, marginRight: '0.5em', border: '2px solid #06b6d4' }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={<Link href={`/spirit/${spirit.slug}`}>{spirit.name}</Link>}
              secondary={
                <Typography
                  sx={{ display: 'inline', fontWeight: '400', fontSize: '0.75rem' }}
                  component="span"
                  variant="subtitle2"
                  color="text.secondary"
                >
                  {spirit.complexity} Complexity
                </Typography>
              }
            />
          </ListItem>
        </Fragment>
      ))}
    </List>
  );
}
