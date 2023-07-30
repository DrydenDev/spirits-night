import { useCallback, useState} from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";

import { getRandomSpirit, getSpiritBySlug } from "~/models/Spirit.server";
import { getTodaySeed } from "~/utils/random";
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
import LinkIcon from '@mui/icons-material/Link';
import TodayIcon from '@mui/icons-material/Today';
import { useStatusSnackbar, StatusSnackbar } from "~/components/StatusSnackbar";

import spiritStyles from "~/styles/spirit.css";

export const links = () => [
  { rel: "stylesheet", href: spiritStyles }
];

export async function loader({ params }) {
  const { slug } = params;
  
  if (slug === "random" || slug === "today") {
    const randomSeed = (slug === "today") ? getTodaySeed() : null;
    const randomSpirit = await getRandomSpirit(randomSeed);
    return redirect(`/spirit/${randomSpirit.slug}`);
  }

  const spirit = await getSpiritBySlug(slug);
  if (spirit) {
    return json({ spirit });
  }

  throw new Response(null, {
    status: 404,
    statusText: "Spirit not found"
  });
}

export default function SpiritDetails() {
  const { spirit } = useLoaderData();
  const navigate = useNavigate();
  const linkPage = (slugLink) => navigate(`/spirit/${slugLink}`);
  const { openSnackbar, closeSnackbar, open: snackbarOpen, text: snackbarText } = useStatusSnackbar();

  return (
    <>
      <Card variant="outlined">
        <CardMedia 
          sx={{height:140}}
          image="https://spiritislandwiki.com/images/d/d6/Spirit_island_box.png"
          title={spirit.name}
        />
        <CardContent className="spirit-card">
          <Typography align="center" gutterBottom variant="h3">{spirit.name}</Typography>
          <Stack sx={{ justifyContent: 'center' }} direction="row" spacing={1}>
            <Chip variant="outlined" label={`${spirit.complexity} Complexity`} />
            <Chip label={spirit.expansion} />
          </Stack>
        </CardContent>
        <CardActions sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }}>
            <Button 
              variant="outlined"
              size="medium"
              color="primary"
              onClick={() => linkPage("random")}
              startIcon={<ReplayIcon />}>
              Random Spirit
            </Button>
            <Button 
              size="medium"
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                openSnackbar("Permalink copied!");
              }}
              startIcon={<LinkIcon />}>
              Permalink
            </Button>
            <Button 
              size="medium"
              color="primary"
              onClick={() => linkPage("today")}
              startIcon={<TodayIcon />}>
              Today's Spirit
            </Button>
          </Stack>
        </CardActions>
      </Card>
      <StatusSnackbar
        open={snackbarOpen}
        onClose={closeSnackbar}
        text={snackbarText}
      />
    </>
  );
}
