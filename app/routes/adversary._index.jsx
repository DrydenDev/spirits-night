import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { 
  Avatar,
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
import { getAllAdversaries } from '~/models/Adversary.server';

export async function loader() {
  const adversaries = await getAllAdversaries();

  return json({ adversaries });
}

export default function AdversaryIndex() {
  const { adversaries } = useLoaderData();

  return (
    <Card variant="outlined">
      <CardMedia 
        sx={{height:140}}
        image='./images/adversaries/adversary_splash.jpg'
        title="Spirit Island Adversaries"
      />
      <CardContent className="adversary-list">
        <Stack direction="column" spacing={2}>
          <Typography align="center" variant="h3">Adversaries</Typography>
          <AdversaryList adversaries={adversaries} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function AdversaryList({ adversaries }) {
  const difficultyRange = (adversary) => {
    const baseDifficulty = adversary.difficulty;
    const maxDifficulty = Math.max(...adversary.levels.map((level) => level.difficulty));
    return `${baseDifficulty} - ${maxDifficulty}`;
  }

  const adversaryList = adversaries.map((adversary, index) => {
    const dividerMarkup = (index === 0) ? null : <Divider variant="inset" component="li" />
    return  (
      <>
        {dividerMarkup}
        <ListItem key={adversary.id} alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt={adversary.name} src="/images/adversaries/france.png" />
          </ListItemAvatar>
          <ListItemText
            primary={<Link href={`/adversary/${adversary.slug}`}>{adversary.name}</Link>}
            secondary={<Typography sx={{ display: 'inline', fontWeight: '400', fontSize: '0.75rem' }} component="span" variant="subtitle2" color="text.secondary">Difficulty Range: {difficultyRange(adversary)}</Typography>}
          />
        </ListItem>
      </>
    );
  })

  return (
    <List>
      {adversaryList}
    </List>
  )
}