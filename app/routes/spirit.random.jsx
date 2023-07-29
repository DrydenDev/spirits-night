import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";

import { getRandomSpirit } from "../models/Spirit.server";
import { 
  Button,
  Card,
  CardActions, 
  CardMedia, 
  CardContent,
  Chip,
  Typography,
  Stack,
} from "@mui/material";
import ReplayIcon from '@mui/icons-material/Replay';

import spiritStyles from "~/styles/spirit.css";

export const links = () => [
  { rel: "stylesheet", href: spiritStyles }
];

export async function loader() {
  return json({ spirit: await getRandomSpirit() });
}

export default function Index() {
  const { spirit } = useLoaderData();
  const navigate = useNavigate();
  const reloadPage = () => navigate('.', { replace: true });

  return (
    <Card variant="outlined" className="spirit-card">
      <CardMedia 
        sx={{height:140}}
        image="https://spiritislandwiki.com/images/d/d6/Spirit_island_box.png"
        title={spirit.name}
      />
      <CardContent>
        <Typography align="center" gutterBottom variant="h3">{spirit.name}</Typography>
        <Stack direction="row" spacing={1}>
          <Chip variant="outlined" label={spirit.complexity} />
          <Chip label={spirit.expansion} />
        </Stack>
      </CardContent>
      <CardActions>
        <Button 
          variant="outlined"
          size="medium"
          color="primary"
          onClick={reloadPage}
          startIcon={<ReplayIcon />}>
            New Spirit
          </Button>
      </CardActions>
    </Card>
  );
}
