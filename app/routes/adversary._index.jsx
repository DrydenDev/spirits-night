import { Fragment, useMemo } from 'react';
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
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
} from "@mui/material";
import CasinoIcon from '@mui/icons-material/Casino';
import TodayIcon from '@mui/icons-material/Today';
import { getAllAdversaries } from '~/models/Adversary.server';

export async function loader() {
  const adversaries = await getAllAdversaries();

  return json({ adversaries });
}

export default function AdversaryIndex() {
  const { adversaries } = useLoaderData();
  const navigate = useNavigate();

  return (
    <>
      <Card square>
        <CardMedia 
          sx={{height:140}}
          image='/images/adversaries/adversary_splash.jpg'
          title="Spirit Island Adversaries"
        />
        <CardContent className="adversary-list">
          <Stack direction="column" spacing={2}>
            <Typography align="center" variant="h3">Adversaries</Typography>
            <AdversaryList adversaries={adversaries} />
          </Stack>
        </CardContent>
      </Card>
      <BottomNavigation
        showLabels
        onChange={(event, selectedValue) => {
          navigate(`/adversary/${selectedValue}`);
        }}
      >
        <BottomNavigationAction label="Random" value="random" icon={<CasinoIcon />} />
        <BottomNavigationAction label="Today" value="today" icon={<TodayIcon />} />
      </BottomNavigation>
    </>
  );
}

function AdversaryList({ adversaries }) {
  const difficultyRange = (adversary) => {
    const baseDifficulty = adversary.difficulty;
    const maxDifficulty = Math.max(...adversary.levels.map((level) => level.difficulty));
    return `${baseDifficulty} - ${maxDifficulty}`;
  }

  const sortedAdversaries = useMemo(() => adversaries.sort((a, b) => a.name.localeCompare(b.name)), [adversaries]);

  const adversaryList = sortedAdversaries.map((adversary, index) => {
    const dividerMarkup = (index === 0) ? null : <Divider variant="inset" component="li" />
    return  (
      <Fragment key={adversary.id}>
        {dividerMarkup}
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt={adversary.name} src={`/images/adversaries/${adversary.slug}/avatar.png`} />
          </ListItemAvatar>
          <ListItemText
            primary={<Link href={`/adversary/${adversary.slug}`}>{adversary.name}</Link>}
            secondary={<Typography sx={{ display: 'inline', fontWeight: '400', fontSize: '0.75rem' }} component="span" variant="subtitle2" color="text.secondary">Difficulty Range: {difficultyRange(adversary)}</Typography>}
          />
        </ListItem>
      </Fragment>
    );
  })

  return (
    <List>
      {adversaryList}
    </List>
  )
}