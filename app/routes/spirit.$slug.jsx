import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";

import { getRandomSpirit, getSpiritBySlug } from "../models/Spirit.server";
import { 
  Button,
  Card,
  CardActions, 
  CardMedia, 
  CardContent,
  Chip,
  ImageList,
  ImageListItem,
  Typography,
  Stack,
} from "@mui/material";
import ReplayIcon from '@mui/icons-material/Replay';
import LinkIcon from '@mui/icons-material/Link';
import TodayIcon from '@mui/icons-material/Today';

import spiritStyles from "~/styles/spirit.css";

export const links = () => [
  { rel: "stylesheet", href: spiritStyles }
];

export async function loader({ params }) {
  if (params.slug === "random") {
    return json({ spirit: await getRandomSpirit() });
  }

  if (params.slug === "today") {
    const dateSeed = new Date().toLocaleDateString("en-US");
    return json({ spirit: await getRandomSpirit(dateSeed) });
  }

  const spirit = await getSpiritBySlug(params.slug);
  if (spirit) {
    return json({ spirit });
  }

  throw new Response(null, {
    status: 404,
    statusText: "Spirit not found"
  });
}

export default function Index() {
  const { spirit } = useLoaderData();
  const navigate = useNavigate();
  const linkPage = (slug, options = {}) => navigate(`/spirit/${slug}`, options);

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
          <Chip variant="outlined" label={`${spirit.complexity} Complexity`} />
          <Chip label={spirit.expansion} />
        </Stack>
      </CardContent>
      <CardActions>
        <Button 
          variant="outlined"
          size="medium"
          color="primary"
          onClick={() => linkPage("random", { replace: true })}
          startIcon={<ReplayIcon />}>
            Random Spirit
          </Button>
          <Button 
          size="medium"
          color="primary"
          onClick={() => linkPage(spirit.slug, { replace: true })}
          startIcon={<LinkIcon />}>
            Permalink
          </Button>
          <Button 
          size="medium"
          color="primary"
          onClick={() => linkPage("today", { replace: true })}
          startIcon={<TodayIcon />}>
            Today's Spirit
          </Button>
      </CardActions>
    </Card>
  );
}
