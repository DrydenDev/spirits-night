import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";

import { 
  Box,
  Button,
  Card,
  CardActions, 
  CardMedia, 
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CasinoIcon from '@mui/icons-material/Casino';
import LinkIcon from '@mui/icons-material/Link';
import TodayIcon from '@mui/icons-material/Today';

import { AdversaryCard } from '~/components/AdversaryCard';
import { AdversaryGameplayReference } from "~/components/AdversaryGameplayReference";
import { AdversarySlider } from '~/components/AdversarySlider';
import { AdversaryTagBar } from "~/components/AdversaryTagBar";
import { useStatusSnackbar, StatusSnackbar } from "~/components/StatusSnackbar";

import { getRandomAdversary, getAdversaryBySlug } from "~/models/Adversary.server";
import { getTodaySeed } from "~/utils/random";

const TAB_TYPE = {
  card: "CARD",
  reference: "REFERENCE"
}

export async function loader({ params }) {
  const [slug, capturedLevel] = params['*'].split('/');
  const clampedLevel = capturedLevel ? Math.min(Math.max(capturedLevel, 0), 6) : null;

  if (slug === "random" || slug === "today") {
    const randomSeed = (slug === "today") ? getTodaySeed() : null;
    const { adversary, level } = await getRandomAdversary(randomSeed);
    const desiredLevel = clampedLevel || level;
    return redirect(`/adversary/${adversary.slug}/${desiredLevel}`);
  }

  const adversary = await getAdversaryBySlug(slug);
  if (adversary) {
    return json({ adversary, level: clampedLevel || 6 });
  }

  throw new Response(null, {
    status: 404,
    statusText: "Adversary not found"
  });
}

function getDifficultyLevel(adversary, level) {
  return adversary.levels.find((adversaryLevel) => adversaryLevel.level === level);
}

export default function AdversaryDetails() {
  const { adversary, level } = useLoaderData();
  const { openSnackbar, closeSnackbar, open: snackbarOpen, text: snackbarText } = useStatusSnackbar();
  const [sliderLevel, setSliderLevel] = useState(level);
  const [currentTab, setCurrentTab] = useState(TAB_TYPE.card);
  const effectiveLevel = sliderLevel !== null ? sliderLevel : level;

  const navigate = useNavigate();
  const linkPage = (slugLink, levelLink) => {
    const baseUrl = `/adversary/${slugLink}`;
    const levelUrl = levelLink ? `${baseUrl}/${levelLink}` : baseUrl;
    setSliderLevel(null);
    navigate(levelUrl)
  };

  const currentTabMarkup = currentTab === TAB_TYPE.card ? (
    <AdversaryCard adversary={adversary} level={effectiveLevel} />
  ) : (
    <AdversaryGameplayReference adversary={adversary} level={effectiveLevel} />
  )

  return (
    <>
      <Card square>
        <CardMedia 
          sx={{height:140}}
          image={`/images/adversaries/${adversary.slug}/banner.png`}
          title={adversary.name}
        />
        <CardContent className="adversary-card">
          <Stack spacing={2} centered={true}>
            <Typography align="center" gutterBottom variant="h3">{adversary.name}</Typography>
            <AdversarySlider
              level={effectiveLevel}
              onChange={(level) => setSliderLevel(level)}
              onCommit={(level) => window.history.replaceState({}, "Spirits Night", `/adversary/${adversary.slug}/${level}`)}
            />
            <AdversaryModeTabs currentTab={currentTab} onChange={(value) => setCurrentTab(value)} />
            { currentTabMarkup }
            <AdversaryTagBar adversary={adversary} level={effectiveLevel} />
          </Stack>
        </CardContent>
        <CardActions sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }}>
            <Button 
              variant="outlined"
              size="medium"
              color="primary"
              onClick={() => linkPage("random")}
              startIcon={<CasinoIcon />}>
              Random Adversary
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
              Today's Adversary
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

function AdversaryModeTabs({ currentTab, onChange }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={currentTab} centered={true} onChange={(event, value) => onChange(value)}>
        <Tab value={TAB_TYPE.card} label="Adversary Card" />
        <Tab value={TAB_TYPE.reference} label="Gameplay Reference" />
      </Tabs>
    </Box>
  );
}