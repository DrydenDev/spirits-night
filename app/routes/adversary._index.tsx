import { Fragment, useMemo } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
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
import { Casino as CasinoIcon } from '@mui/icons-material';
import { Today as TodayIcon } from '@mui/icons-material';
import { getAllAdversaries } from '~/models/Adversary';
import type { Adversary } from '~/types/domain';

export const meta = () => [
  { name: 'title', content: 'Adversaries' },
  { name: 'description', content: 'List of all Spirit Island Adversaries' },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: 'Adversaries' },
  { property: 'og:description', content: 'List of Spirit Island Adversaries' },
  { property: 'og:image', content: '/images/adversaries/adversary_splash.jpg' },
];

export async function clientLoader() {
  const adversaries = getAllAdversaries();
  return { adversaries };
}

export default function AdversaryIndex() {
  const { adversaries } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  return (
    <>
      <Card square>
        <CardMedia
          sx={{ height: 140 }}
          image="/images/adversaries/adversary_splash.jpg"
          title="Spirit Island Adversaries"
        />
        <CardContent className="adversary-list">
          <Stack direction="column" spacing={2}>
            <Typography align="center" variant="h3">
              Adversaries
            </Typography>
            <AdversaryList adversaries={adversaries} />
          </Stack>
        </CardContent>
      </Card>
      <BottomNavigation
        showLabels
        onChange={(_, selectedValue) => navigate(`/adversary/${selectedValue}`)}
      >
        <BottomNavigationAction label="Random" value="random" icon={<CasinoIcon />} />
        <BottomNavigationAction label="Today" value="today" icon={<TodayIcon />} />
      </BottomNavigation>
    </>
  );
}

function AdversaryList({ adversaries }: { adversaries: Adversary[] }) {
  const difficultyRange = (adversary: Adversary) => {
    const maxDifficulty = Math.max(...adversary.levels.map((level) => level.difficulty));
    return `${adversary.difficulty} - ${maxDifficulty}`;
  };

  const sortedAdversaries = useMemo(
    () => [...adversaries].sort((a, b) => a.name.localeCompare(b.name)),
    [adversaries]
  );

  return (
    <List>
      {sortedAdversaries.map((adversary, index) => (
        <Fragment key={adversary.id}>
          {index > 0 && <Divider variant="inset" component="li" />}
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar
                alt={adversary.name}
                src={`/images/adversaries/${adversary.slug}/avatar.png`}
                sx={{ width: 56, height: 56, marginRight: '0.5em', border: '1px solid lightgray' }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={<Link href={`/adversary/${adversary.slug}`}>{adversary.name}</Link>}
              secondary={
                <Typography
                  sx={{ display: 'inline', fontWeight: '400', fontSize: '0.75rem' }}
                  component="span"
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Difficulty Range: {difficultyRange(adversary)}
                </Typography>
              }
            />
          </ListItem>
        </Fragment>
      ))}
    </List>
  );
}
