import { useState } from 'react';
import { redirect } from 'react-router';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData, useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Casino as CasinoIcon } from '@mui/icons-material';
import { Link as LinkIcon } from '@mui/icons-material';
import { Today as TodayIcon } from '@mui/icons-material';

import { AdversaryCard } from '~/components/AdversaryCard';
import { AdversaryGameplayReference } from '~/components/AdversaryGameplayReference';
import { AdversarySlider } from '~/components/AdversarySlider';
import { AdversaryTagBar } from '~/components/AdversaryTagBar';
import { useStatusSnackbar, StatusSnackbar } from '~/components/StatusSnackbar';
import { getRandomAdversary, getAdversaryBySlug } from '~/models/Adversary.server';
import { getTodaySeed } from '~/utils/random';
import {
  ADVERSARY_MIN_LEVEL,
  ADVERSARY_MAX_LEVEL,
  TODAY_MIN_ADVERSARY_LEVEL,
} from '~/constants/game';

const TAB_TYPE = {
  card: 'card',
  reference: 'reference',
} as const;

type TabType = (typeof TAB_TYPE)[keyof typeof TAB_TYPE];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { adversary, level } = data;
  return [
    { name: 'title', content: `${adversary.name} ${level}` },
    { name: 'description', content: `Adversary rules for ${adversary.name} at level ${level}` },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: `${adversary.name} ${level}` },
    { property: 'og:description', content: `Adversary rules for ${adversary.name} at level ${level}` },
    { property: 'og:image', content: `/images/adversaries/${adversary.slug}/banner.png` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const [slug, rawLevel] = (params['*'] ?? '').split('/');
  const parsedLevel = rawLevel !== undefined ? parseInt(rawLevel, 10) : null;
  const clampedLevel =
    parsedLevel !== null && !isNaN(parsedLevel)
      ? Math.min(Math.max(parsedLevel, ADVERSARY_MIN_LEVEL), ADVERSARY_MAX_LEVEL)
      : null;

  if (slug === 'random' || slug === 'today') {
    const randomSeed = slug === 'today' ? getTodaySeed() : null;
    const { adversary, level } = await getRandomAdversary(randomSeed);
    const desiredLevel =
      clampedLevel ?? (slug === 'today' ? Math.max(TODAY_MIN_ADVERSARY_LEVEL, level) : level);
    return redirect(`/adversary/${adversary.slug}/${desiredLevel}`);
  }

  const adversary = await getAdversaryBySlug(slug);
  if (adversary) {
    return { adversary, level: clampedLevel ?? ADVERSARY_MAX_LEVEL };
  }

  throw new Response(null, { status: 404, statusText: 'Adversary not found' });
}

export default function AdversaryDetails() {
  const { adversary, level } = useLoaderData<typeof loader>();
  const { openSnackbar, closeSnackbar, open: snackbarOpen, text: snackbarText } = useStatusSnackbar();
  const [sliderLevel, setSliderLevel] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>(TAB_TYPE.card);
  const effectiveLevel = sliderLevel ?? level;

  const navigate = useNavigate();
  const linkPage = (slugLink: string) => {
    setSliderLevel(null);
    navigate(`/adversary/${slugLink}`);
  };

  const currentTabMarkup =
    currentTab === TAB_TYPE.card ? (
      <AdversaryCard adversary={adversary} level={effectiveLevel} />
    ) : (
      <AdversaryGameplayReference adversary={adversary} level={effectiveLevel} />
    );

  return (
    <>
      <Card square>
        <CardMedia
          sx={{ height: 140 }}
          image={`/images/adversaries/${adversary.slug}/banner.png`}
          title={adversary.name}
        />
        <CardContent className="adversary-card">
          <Stack spacing={2}>
            <Typography align="center" gutterBottom variant="h3">
              {adversary.name}
            </Typography>
            <AdversarySlider
              level={effectiveLevel}
              onChange={(newLevel) => setSliderLevel(newLevel)}
              onCommit={(newLevel) =>
                window.history.replaceState(
                  {},
                  'Spirits Night',
                  `/adversary/${adversary.slug}/${newLevel}`
                )
              }
            />
            <AdversaryModeTabs currentTab={currentTab} onChange={setCurrentTab} />
            {currentTabMarkup}
            <AdversaryTagBar adversary={adversary} level={effectiveLevel} />
          </Stack>
        </CardContent>
        <CardActions sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }}>
            <Button
              variant="outlined"
              size="medium"
              color="primary"
              onClick={() => linkPage('random')}
              startIcon={<CasinoIcon />}
            >
              Random Adversary
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
              Today&apos;s Adversary
            </Button>
          </Stack>
        </CardActions>
      </Card>
      <StatusSnackbar open={snackbarOpen} onClose={closeSnackbar} text={snackbarText} />
    </>
  );
}

interface AdversaryModeTabsProps {
  currentTab: TabType;
  onChange: (value: TabType) => void;
}

function AdversaryModeTabs({ currentTab, onChange }: AdversaryModeTabsProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={currentTab} centered onChange={(_, value) => onChange(value)}>
        <Tab value={TAB_TYPE.card} label="Card" />
        <Tab value={TAB_TYPE.reference} label="Reference" />
      </Tabs>
    </Box>
  );
}
