<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { getAdversaryBySlug } from '~/models/Adversary';
import { getSpiritBySlug } from '~/models/Spirit';
import PlayForm from './PlayForm.vue';
import PlaySummary from './PlaySummary.vue';
import { difficultyForPlay } from './summary';
import {
  loadPlays,
  MAX_PLAYER_COUNT,
  mergeImportedPlays,
  MIN_PLAYER_COUNT,
  parsePlayArchive,
  PLAY_STORAGE_KEY,
  savePlays,
  serializePlayArchive,
} from './storage';
import type { Play, PlayInput, PlayResult } from './types';

const route = useRoute();
const plays = ref<Play[]>([]);
const editingPlay = ref<Play | null>(null);
const pendingDeleteId = ref<string | null>(null);
const message = ref('');
const errorMessage = ref('');
const storageReady = ref(false);
const form = ref<{ reset: () => void } | null>(null);
const importInput = ref<HTMLInputElement | null>(null);

const sortedPlays = computed(() =>
  [...plays.value].sort((first, second) => second.date.localeCompare(first.date))
);
const prefill = computed(() => {
  const adversarySlug = typeof route.query.adversary === 'string' ? route.query.adversary : '';
  const spiritSlug = typeof route.query.spirit === 'string' ? route.query.spirit : '';
  const lineupQuery = typeof route.query.spirits === 'string' ? route.query.spirits : '';
  const lineup = lineupQuery ? lineupQuery.split(',') : [];
  const validLineup =
    lineup.length >= MIN_PLAYER_COUNT &&
    lineup.length <= MAX_PLAYER_COUNT &&
    new Set(lineup).size === lineup.length &&
    lineup.every((slug) => getSpiritBySlug(slug) !== null);
  const level = Number(route.query.level);
  const adversary = getAdversaryBySlug(adversarySlug);
  return {
    ...(adversary ? { adversarySlug } : {}),
    ...(adversary?.levels.some((row) => row.level === level) ? { level } : {}),
    ...(validLineup
      ? { spiritSlugs: lineup }
      : getSpiritBySlug(spiritSlug)
        ? { spiritSlugs: [spiritSlug] }
        : {}),
  };
});

function browserStorage(): PlayResult<Storage> {
  try {
    return { ok: true, value: window.localStorage };
  } catch (error) {
    console.error({ event: 'play_log_storage_unavailable', error });
    return {
      ok: false,
      message: 'This browser is blocking local storage. Saved games are unavailable.',
    };
  }
}

function showError(text: string): void {
  errorMessage.value = text;
  message.value = '';
}

function reload(): void {
  const storage = browserStorage();
  if (!storage.ok) {
    storageReady.value = false;
    showError(storage.message);
    return;
  }
  const result = loadPlays(storage.value);
  if (!result.ok) {
    storageReady.value = false;
    showError(`${result.message} No games were changed.`);
    return;
  }
  plays.value = result.value;
  storageReady.value = true;
  errorMessage.value = '';
}

function updatePlays(transform: (current: Play[]) => PlayResult<Play[]>): boolean {
  const storage = browserStorage();
  if (!storage.ok) {
    showError(storage.message);
    return false;
  }
  const current = loadPlays(storage.value);
  if (!current.ok) {
    showError(current.message);
    return false;
  }
  const next = transform(current.value);
  if (!next.ok) {
    showError(next.message);
    return false;
  }
  const saved = savePlays(storage.value, next.value);
  if (!saved.ok) {
    showError(saved.message);
    return false;
  }
  plays.value = saved.value;
  storageReady.value = true;
  errorMessage.value = '';
  return true;
}

function saveGame(input: PlayInput): void {
  const currentId = editingPlay.value?.id;
  const success = updatePlays((current) => {
    if (currentId && !current.some((play) => play.id === currentId)) {
      return { ok: false, message: 'This game is no longer in the log. Reload before editing it.' };
    }
    const record: Play = {
      ...input,
      spiritSlugs: [...input.spiritSlugs],
      id: currentId ?? crypto.randomUUID(),
    };
    return {
      ok: true,
      value: currentId
        ? current.map((play) => (play.id === currentId ? record : play))
        : [record, ...current],
    };
  });
  if (!success) return;
  editingPlay.value = null;
  form.value?.reset();
  message.value = currentId ? 'Game updated.' : 'Game saved in this browser.';
}

function editGame(play: Play): void {
  pendingDeleteId.value = null;
  editingPlay.value = play;
  message.value = '';
  document
    .getElementById('play-form-heading')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteGame(id: string): void {
  const success = updatePlays((current) => {
    if (!current.some((play) => play.id === id)) {
      return {
        ok: false,
        message: 'This game is no longer in the log. Reload before deleting it.',
      };
    }
    return { ok: true, value: current.filter((play) => play.id !== id) };
  });
  if (!success) return;
  if (editingPlay.value?.id === id) editingPlay.value = null;
  pendingDeleteId.value = null;
  message.value = 'Game deleted.';
}

function downloadArchive(): void {
  try {
    const blob = new Blob([serializePlayArchive(plays.value)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spirits-night-plays.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    message.value = 'Play log exported.';
    errorMessage.value = '';
  } catch (error) {
    console.error({ event: 'play_log_export_failed', error });
    showError('The play log could not be exported. Try again in this browser.');
  }
}

async function importArchive(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  let contents: string;
  try {
    contents = await file.text();
  } catch (error) {
    console.error({ event: 'play_log_import_read_failed', error });
    showError('The selected file could not be read.');
    return;
  }
  const imported = parsePlayArchive(contents);
  if (!imported.ok) {
    console.warn({ event: 'play_log_import_rejected', reason: imported.message });
    showError(imported.message);
    return;
  }
  let added = 0;
  const success = updatePlays((current) => {
    const merged = mergeImportedPlays(current, imported.value);
    added = merged.length - current.length;
    return { ok: true, value: merged };
  });
  if (success)
    message.value = added
      ? `${added} ${added === 1 ? 'game' : 'games'} imported.`
      : 'All games in that file are already here.';
}

function storageChanged(event: StorageEvent): void {
  if (event.key === PLAY_STORAGE_KEY || event.key === null) reload();
}

onMounted(() => {
  document.title = 'Game nights | Spirits Night';
  reload();
  window.addEventListener('storage', storageChanged);
});
onUnmounted(() => window.removeEventListener('storage', storageChanged));

const feelLabels = { easy: 'Too easy', right: 'About right', hard: 'Too hard' } as const;
</script>

<template>
  <div>
    <header class="pt-8 pb-6">
      <h1 class="text-3xl sm:text-4xl">Game nights</h1>
      <p class="text-slate-400 mt-2 max-w-xl">
        Keep a record of what you played and find a difficulty that feels right for your group.
      </p>
    </header>

    <p
      v-if="errorMessage"
      role="alert"
      class="rounded-lg border border-red-700/60 bg-red-950/30 px-4 py-3 text-sm text-red-200 mb-5"
    >
      {{ errorMessage }}
    </p>
    <p
      v-if="message"
      role="status"
      class="rounded-lg border border-teal-700/60 bg-teal-950/30 px-4 py-3 text-sm text-teal-100 mb-5"
    >
      {{ message }}
    </p>

    <template v-if="storageReady">
      <PlayForm
        ref="form"
        :editing-play="editingPlay"
        :prefill="prefill"
        @save="saveGame"
        @cancel="editingPlay = null"
      />
      <div class="mt-8">
        <PlaySummary :plays="plays" />
      </div>

      <section aria-labelledby="history-heading" class="mt-10">
        <div class="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h2 id="history-heading" class="text-xl">Past games</h2>
            <p class="text-sm text-slate-400 mt-1">{{ plays.length }} saved in this browser</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="action-link" @click="downloadArchive">Export JSON</button>
            <button type="button" class="action-link" @click="importInput?.click()">
              Import JSON
            </button>
            <input
              ref="importInput"
              type="file"
              accept="application/json,.json"
              class="sr-only"
              aria-label="Choose play log JSON file"
              @change="importArchive"
            />
          </div>
        </div>
        <p class="text-xs text-slate-500 mb-5">
          Games stay in this browser. Export a backup before clearing browser data or changing
          devices. Import adds new games without replacing existing ones.
        </p>

        <div
          v-if="!plays.length"
          class="border border-dashed border-depth-500 rounded-xl p-6 text-slate-400"
        >
          No games yet. Record tonight's matchup above to start your log.
        </div>
        <ol v-else class="divide-y divide-depth-600 border-y border-depth-600">
          <li v-for="play in sortedPlays" :key="play.id" class="py-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-sm text-slate-400">
                  {{ play.date }} · {{ play.playerCount }}
                  {{ play.playerCount === 1 ? 'player' : 'players' }}
                </p>
                <h3 class="text-base mt-1">
                  <RouterLink
                    :to="`/adversary/${play.adversarySlug}/${play.level}`"
                    class="text-teal-300 hover:text-teal-100"
                    >{{ getAdversaryBySlug(play.adversarySlug)?.name }}</RouterLink
                  >
                  <span class="text-slate-300"> · Level {{ play.level }}</span>
                </h3>
                <p class="text-sm text-slate-400 mt-1">
                  Difficulty {{ difficultyForPlay(play) }} ·
                  {{ play.result === 'win' ? 'Win' : 'Loss' }} ·
                  {{ feelLabels[play.feltDifficulty] }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="action-link"
                  :aria-label="`Edit game from ${play.date}`"
                  @click="editGame(play)"
                >
                  Edit
                </button>
                <button
                  v-if="pendingDeleteId !== play.id"
                  type="button"
                  class="action-link"
                  :aria-label="`Delete game from ${play.date}`"
                  @click="pendingDeleteId = play.id"
                >
                  Delete
                </button>
                <button
                  v-else
                  type="button"
                  class="action-link border-red-700 text-red-200"
                  :aria-label="`Confirm delete game from ${play.date}`"
                  @click="deleteGame(play.id)"
                >
                  Confirm delete
                </button>
              </div>
            </div>
            <p class="text-sm text-slate-300 mt-2">
              Spirits:
              <template v-for="(slug, index) in play.spiritSlugs" :key="slug"
                ><span v-if="index">, </span
                ><RouterLink :to="`/spirit/${slug}`" class="text-teal-300 hover:text-teal-100">{{
                  getSpiritBySlug(slug)?.name
                }}</RouterLink></template
              >
            </p>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>
