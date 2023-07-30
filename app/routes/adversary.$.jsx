import { useCallback, useMemo, useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { 
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardActions, 
  CardMedia, 
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import CasinoIcon from '@mui/icons-material/Casino';
import LinkIcon from '@mui/icons-material/Link';
import TodayIcon from '@mui/icons-material/Today';

import { useStatusSnackbar, StatusSnackbar } from "~/components/StatusSnackbar";
import { getRandomAdversary, getAdversaryBySlug } from "~/models/Adversary.server";
import { toSpiritIslandText } from "~/utils/spiritIslandText";
import { getTodaySeed } from "~/utils/random";

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
  const [sliderLevel, setSliderLevel] = useState(level);
  const { openSnackbar, closeSnackbar, open: snackbarOpen, text: snackbarText } = useStatusSnackbar();
  const effectiveLevel = sliderLevel !== null ? sliderLevel : level;
  const navigate = useNavigate();
  const linkPage = useCallback((slugLink, levelLink) => {
    const baseUrl = `/adversary/${slugLink}`;
    const levelUrl = levelLink ? `${baseUrl}/${levelLink}` : baseUrl;
    setSliderLevel(null);
    navigate(levelUrl)
  }, [adversary]);

  return (
    <>
      <Card square>
        <CardMedia 
          sx={{height:140}}
          image='https://spiritislandwiki.com/images/d/d6/Spirit_island_box.png'
          title={adversary.name}
        />
        <CardContent className="adversary-card">
          <Typography align="center" gutterBottom variant="h3">{adversary.name}</Typography>
          <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} spacing={1}>
            <Slider
              size="medium"
              aria-label="Adversary difficulty"
              value={effectiveLevel}
              valueLabelDisplay="auto"
              step={null}
              marks={[...Array(7).keys()].map((level) => ({ value: level, label: level }))}
              min={0}
              max={6}
              sx={{
                width: "50%"
              }}
              onChange={(event, value) => setSliderLevel(value)}
              onChangeCommitted={(event, value) => {
                window.history.replaceState({}, "Spirits Night", `/adversary/${adversary.slug}/${value}`);
              }}
            />
          </Stack>
          <AdversaryTable adversary={adversary} level={effectiveLevel} />
          <Stack sx={{ justifyContent: 'center' }} direction="row" spacing={1}>
            <LevelChips adversary={adversary} level={effectiveLevel} />
            <Chip label={adversary.expansion} />
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
        message={snackbarText}
      />
    </>
  );
}

function LevelChips({level, adversary, ...additionalProps}) {
  const difficultyLevel = getDifficultyLevel(adversary, level)?.difficulty || adversary.difficulty;
  const dangerColor = difficultyLevel > 7 ? "error" : difficultyLevel > 4 ? "warning" : "success";
  const difficultyChip = difficultyLevel ? 
    <Chip color={dangerColor} variant="filled" label={`Difficulty ${difficultyLevel}`}/> : null;

  return (
    <>
      <Chip color="primary" label={`Level ${level}`} {...additionalProps} />
      {difficultyChip}
    </>
  );
}

function AdversaryTable({adversary, level}) {
  const { lossCondition, escalationAbility, levels } = adversary;
  const difficultyLevel = getDifficultyLevel(adversary, level);
  const lossConditionMarkup = !lossCondition ? null : (
    <Alert severity="error">
      <AlertTitle>Additional Loss Condition</AlertTitle>
      <strong>{lossCondition.title}</strong>: {toSpiritIslandText(lossCondition.description)}
    </Alert>
  );

  const escalationMarkup = (
    <Alert severity="warning">
      <AlertTitle>Escalation</AlertTitle>
      <strong>{escalationAbility.title}</strong>: {toSpiritIslandText(escalationAbility.description)}
    </Alert>
  );

  const fearMarkup = (
    <Stack direction="column" className="fear-card" spacing={0}>
      <Box className="header-bar"><Typography variant="h4">Fear Cards</Typography></Box>
      <Box className="body-text"><Typography variant="body1">{difficultyLevel?.fearCards || "3/3/3"}</Typography></Box>
    </Stack>
  );

  const levelItems = levels.map((levelRow, index) => {
    if (levelRow.level > level) return;
    return (
      <ListItem key={index}>
        <ListItemText
          key={index}
          primary={levelRow.title}
          secondary={toSpiritIslandText(levelRow.description)}
        />
      </ListItem>
    )
  });
  const levelsMarkup = levelItems.length > 0 ? (
    <List>{levelItems}</List>
  ) : null;

  return (
    <>
      <Paper elevation={2} className="adversary-card">
        <Stack direction="column" spacing={2}>
          {lossConditionMarkup}
          {escalationMarkup}
          {fearMarkup}
          {levelsMarkup}
        </Stack>
      </Paper> 
    </>
  );
}