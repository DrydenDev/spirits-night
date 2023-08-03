import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import ColorThief from "colorthief";

import { getRandomSpirit, getSpiritBySlug } from "~/models/Spirit.server";
import { getTodaySeed } from "~/utils/random";
import {
  Box,
  Button,
  Card,
  CardActions, 
  CardMedia, 
  CardContent,
  Chip,
  Divider,
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

async function getSpiritColor(url, spirit) {
  try {
    const palette = await ColorThief.getPalette(`http://${url.hostname}:${url.port}/images/spirits/${spirit.slug}/splash.png`);
    return palette[Math.floor ( Math.random() * palette.length)];
  } catch(err) {
    // #A782EC -- Purple that will show nice on background
    console.log("Error fetching spirit color", err);
    return [65, 51, 93];
  }
}

function getBackgroundColor(color) {
  const brightness = (r,g,b) => Math.sqrt(
    r * r * .241 +
    g * g * .691 +
    b * b * .068
  );
  const brighten = (facet) => Math.min(255, facet * 1.5);
  const darken = (facet) => facet * .5;

  let backgroundColor = color;
  if (brightness(...color) > 130) {
    while(brightness(...backgroundColor) > 50) {
      backgroundColor = backgroundColor.map(darken);
    }
    backgroundColor = {
      font: 'white',
      color: [...backgroundColor, 0.8]
    }
  } else {
    while(brightness(...backgroundColor) < 200) {
      backgroundColor = backgroundColor.map(brighten);
    }
    backgroundColor = {
      font: 'black',
      color: [...backgroundColor, 0.5]
    }
  }

  return backgroundColor;
}

export async function loader({ params, request }) {
  const { slug } = params;
  const url = new URL(request.url);
  
  if (slug === "random" || slug === "today") {
    const randomSeed = (slug === "today") ? getTodaySeed() : null;
    const randomSpirit = await getRandomSpirit(randomSeed);
    return redirect(`/spirit/${randomSpirit.slug}`);
  }

  const spirit = await getSpiritBySlug(slug);
  const spiritColor = await getSpiritColor(new URL(request.url), spirit);
  if (spirit) {
    return json({ spirit, spiritColor });
  }

  throw new Response(null, {
    status: 404,
    statusText: "Spirit not found"
  });
}

export default function SpiritDetails() {
  const { spirit, spiritColor } = useLoaderData();
  const navigate = useNavigate();
  const linkPage = (slugLink) => navigate(`/spirit/${slugLink}`);
  const { openSnackbar, closeSnackbar, open: snackbarOpen, text: snackbarText } = useStatusSnackbar();

  return (
    <>
      <Card square>
        <CardMedia 
          sx={{height:200}}
          image={`/images/spirits/${spirit.slug}/splash.png`}
          title={spirit.name}
        />
        <CardContent className="spirit-card">
          <Typography align="center" gutterBottom variant="h3">{spirit.name}</Typography>
          <PlaystyleCard text={spirit.playstyle} />
          <SpiritChart spirit={spirit} color={spiritColor} />
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

function PlaystyleCard({ text }) {
  return (
    <>
      <Stack direction="column" className="playstyle-card" sx={{ maxWidth: { sm: '100%', md: '75%' }}}>
        <Typography variant="h6" as="h4" gutterBottom>Playstyle</Typography>
        <Typography variant="body2">{text}</Typography>
      </Stack>
    </>
  );
}

function SpiritChart({ spirit, color }) {
  const spiritChartData = [
    {
      name: "Offense",
      attribute: spirit.offense
    },
    {
      name: "Control",
      attribute: spirit.control,
    },
    {
      name: "Fear",
      attribute: spirit.fear,
    },
    {
      name: "Defense",
      attribute: spirit.defense
    },
    {
      name: "Utility",
      attribute: spirit.utility,
    }
  ];

  const minTicks = Math.min(0, ...spiritChartData.map((s) => s.attribute));
  const maxTicks = Math.max(5, ...spiritChartData.map((s) => s.attribute));
  const ticks = Array.from(Array(maxTicks - minTicks + 1), (x, i) => i - minTicks);
  const backgroundColor = getBackgroundColor(color);

  return (
    <Box className="spirit-chart" sx={{backgroundColor: `rgb(${backgroundColor.color})`}}>
      <ResponsiveContainer width="100%" height={240} minWidth={300}>
        <BarChart width="100%" height={240} data={spiritChartData}>
          <YAxis hide={true} ticks={ticks} />
          <XAxis dataKey="name" tickLine={false} interval={0} tick={{fontWeight: 400, fill: backgroundColor.font }} />
          <Bar dataKey="attribute" fill={`rgb(${color})`} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}