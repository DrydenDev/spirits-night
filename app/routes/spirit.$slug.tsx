import { redirect } from 'react-router';
import type { ClientLoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ColorThief from 'colorthief';

import { getRandomSpirit, getSpiritBySlug } from '~/models/Spirit';
import { getTodaySeed } from '~/utils/random';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Replay as ReplayIcon } from '@mui/icons-material';
import { Link as LinkIcon } from '@mui/icons-material';
import { Today as TodayIcon } from '@mui/icons-material';
import { useStatusSnackbar, StatusSnackbar } from '~/components/StatusSnackbar';
import { toSpiritIslandText } from '~/utils/spiritIslandText';
import type { Spirit } from '~/types/domain';

const DEFAULT_SPIRIT_COLOR = [65, 51, 93];

function getBackgroundColor(color: number[]): { font: string; color: number[] } {
  const brightness = (r: number, g: number, b: number) =>
    Math.sqrt(r * r * 0.241 + g * g * 0.691 + b * b * 0.068);
  const brighten = (facet: number) => Math.min(255, facet * 1.5);
  const darken = (facet: number) => facet * 0.5;

  let backgroundColor = color;
  if (brightness(...(color as [number, number, number])) > 130) {
    while (brightness(...(backgroundColor as [number, number, number])) > 50) {
      backgroundColor = backgroundColor.map(darken);
    }
    return { font: 'white', color: [...backgroundColor] };
  } else {
    while (brightness(...(backgroundColor as [number, number, number])) < 200) {
      backgroundColor = backgroundColor.map(brighten);
    }
    return { font: 'black', color: [...backgroundColor, 0.3] };
  }
}

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  if (!data) return [];
  const { spirit } = data;
  return [
    { name: 'title', content: spirit.name },
    { name: 'description', content: `Summary of ${spirit.name}` },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: spirit.name },
    { property: 'og:description', content: `Summary of ${spirit.name}` },
    { property: 'og:image', content: `/images/spirits/${spirit.slug}/splash.png` },
  ];
};

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) throw new Response(null, { status: 404, statusText: 'Spirit not found' });

  if (slug === 'random' || slug === 'today') {
    const randomSeed = slug === 'today' ? getTodaySeed() : null;
    const randomSpirit = getRandomSpirit(randomSeed);
    return redirect(`/spirit/${randomSpirit.slug}`);
  }

  const spirit = getSpiritBySlug(slug);
  if (!spirit) {
    throw new Response(null, { status: 404, statusText: 'Spirit not found' });
  }

  return { spirit };
}

export default function SpiritDetails() {
  const { spirit } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const [spiritColor, setSpiritColor] = useState<number[]>(DEFAULT_SPIRIT_COLOR);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const palette = new ColorThief().getPalette(img, 5) as number[][];
      setSpiritColor(palette[Math.floor(Math.random() * palette.length)]);
    };
    img.src = `/images/spirits/${spirit.slug}/splash.png`;
  }, [spirit.slug]);
  const linkPage = (slugLink: string) => navigate(`/spirit/${slugLink}`);
  const { openSnackbar, closeSnackbar, open: snackbarOpen, text: snackbarText } = useStatusSnackbar();

  return (
    <>
      <Card square>
        <CardMedia
          sx={{ height: 200 }}
          image={`/images/spirits/${spirit.slug}/splash.png`}
          title={spirit.name}
        />
        <CardContent className="spirit-card">
          <Typography align="center" gutterBottom variant="h3">
            {spirit.name}
          </Typography>
          <PlaystyleCard text={spirit.playstyle} color={spiritColor} />
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
              onClick={() => linkPage('random')}
              startIcon={<ReplayIcon />}
            >
              Random Spirit
            </Button>
            <Button
              size="medium"
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                openSnackbar('Permalink copied!');
              }}
              startIcon={<LinkIcon />}
            >
              Permalink
            </Button>
            <Button
              size="medium"
              color="primary"
              onClick={() => linkPage('today')}
              startIcon={<TodayIcon />}
            >
              Today&apos;s Spirit
            </Button>
          </Stack>
        </CardActions>
      </Card>
      <StatusSnackbar open={snackbarOpen} onClose={closeSnackbar} text={snackbarText} />
    </>
  );
}

function PlaystyleCard({ text, color }: { text: string | null; color: number[] }) {
  return (
    <Stack
      direction="column"
      className="playstyle-card"
      sx={{ maxWidth: { sm: '100%', md: '75%' } }}
    >
      <Typography
        variant="h6"
        component="h4"
        gutterBottom
        sx={{ backgroundColor: `rgb(${[...color, 0.2]})` }}
      >
        Playstyle
      </Typography>
      <Typography variant="body2">{toSpiritIslandText(text)}</Typography>
    </Stack>
  );
}

interface SpiritChartData {
  name: string;
  attribute: number;
}

function AttributeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload?.length) {
    return (
      <Paper sx={{ padding: '1em' }}>
        <div>
          <strong>{label}: </strong>
          {payload[0].value}
        </div>
      </Paper>
    );
  }
  return null;
}

function SpiritChart({ spirit, color }: { spirit: Spirit; color: number[] }) {
  const spiritChartData: SpiritChartData[] = [
    { name: 'Offense', attribute: spirit.offense },
    { name: 'Control', attribute: spirit.control },
    { name: 'Fear', attribute: spirit.fear },
    { name: 'Defense', attribute: spirit.defense },
    { name: 'Utility', attribute: spirit.utility },
  ];

  const minTick = Math.min(0, ...spiritChartData.map((s) => s.attribute));
  const maxTick = Math.max(5, ...spiritChartData.map((s) => s.attribute));
  const ticks = Array.from({ length: maxTick - minTick + 1 }, (_, i) => i + minTick);
  const backgroundColor = getBackgroundColor(color);

  return (
    <Box className="spirit-chart" sx={{ backgroundColor: `rgb(${backgroundColor.color})` }}>
      <ResponsiveContainer width="100%" height={240} minWidth={300}>
        <BarChart data={spiritChartData}>
          <YAxis hide ticks={ticks} />
          <XAxis
            dataKey="name"
            tickLine={false}
            interval={0}
            tick={{ fontWeight: 400, fill: backgroundColor.font }}
          />
          <Tooltip
            cursor={{ fill: `rgb(${[...color, 0.1]})` }}
            content={<AttributeTooltip />}
          />
          <Bar dataKey="attribute" fill={`rgb(${color})`} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
