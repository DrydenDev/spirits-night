<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { MAX_PLAYER_COUNT, loadPlays, PLAY_STORAGE_KEY } from '~/features/plays/storage';
import type { Play } from '~/features/plays/types';
import { getAllSpirits } from '~/models/Spirit';
import type { Spirit } from '~/types/domain';
import {
  availableSpirits,
  dealShortlist,
  GO_TO_MINIMUM_PLAYS,
  RECENT_GAME_COUNT,
  summarizeSpiritHistory,
  type HistoryFilter,
} from './picker';

const spirits = [...getAllSpirits()].sort((first, second) => first.name.localeCompare(second.name));
const pickedSlugs = ref<string[]>([]);
const plays = ref<Play[]>([]);
const historyReady = ref(false);
const historyError = ref('');
const activeFilters = ref(new Set<HistoryFilter>());
const shortlist = ref<string[] | null>(null);

const history = computed(() => summarizeSpiritHistory(plays.value));
const pickedSpirits = computed(() =>
  pickedSlugs.value
    .map((slug) => spirits.find((spirit) => spirit.slug === slug))
    .filter((spirit): spirit is Spirit => spirit !== undefined)
);
const eligibleSpirits = computed(() =>
  availableSpirits(spirits, pickedSlugs.value, activeFilters.value, history.value)
);
const visibleSpirits = computed(() => {
  if (shortlist.value === null) return eligibleSpirits.value;
  const dealt = new Set(shortlist.value);
  return eligibleSpirits.value.filter((spirit) => dealt.has(spirit.slug));
});
const goToCount = computed(
  () =>
    [...history.value.playCounts.values()].filter((count) => count >= GO_TO_MINIMUM_PLAYS).length
);
const hasFilters = computed(() => activeFilters.value.size > 0 || shortlist.value !== null);

const historyFilterOptions: { id: HistoryFilter; label: string; hint: string }[] = [
  { id: 'neverPlayed', label: 'Never played', hint: 'Spirits absent from this browser’s log' },
  {
    id: 'outOfRotation',
    label: 'Out of rotation',
    hint: `Not in the last ${RECENT_GAME_COUNT} logged games`,
  },
  { id: 'goTos', label: 'Go-tos', hint: `Played at least ${GO_TO_MINIMUM_PLAYS} times` },
];

function loadHistory(): void {
  let storage: Storage;
  try {
    storage = window.localStorage;
  } catch (error) {
    console.error({ event: 'spirit_picker_storage_unavailable', error });
    historyReady.value = false;
    activeFilters.value = new Set();
    historyError.value = 'Play history is unavailable in this browser.';
    return;
  }
  const result = loadPlays(storage);
  if (!result.ok) {
    historyReady.value = false;
    activeFilters.value = new Set();
    historyError.value = result.message;
    return;
  }
  plays.value = result.value;
  historyReady.value = true;
  historyError.value = '';
}

function toggleFilter(filter: HistoryFilter): void {
  const next = new Set(activeFilters.value);
  if (next.has(filter)) next.delete(filter);
  else next.add(filter);
  activeFilters.value = next;
  if (shortlist.value !== null) shortlist.value = dealShortlist(eligibleSpirits.value);
}

function toggleShortlist(): void {
  shortlist.value = shortlist.value === null ? dealShortlist(eligibleSpirits.value) : null;
}

function clearFilters(): void {
  activeFilters.value = new Set();
  shortlist.value = null;
}

function pickSpirit(slug: string): void {
  if (pickedSlugs.value.length >= MAX_PLAYER_COUNT || pickedSlugs.value.includes(slug)) return;
  pickedSlugs.value = [...pickedSlugs.value, slug];
}

function removeSpirit(slug: string): void {
  pickedSlugs.value = pickedSlugs.value.filter((picked) => picked !== slug);
}

function storageChanged(event: StorageEvent): void {
  if (event.key === PLAY_STORAGE_KEY || event.key === null) loadHistory();
}

onMounted(() => {
  document.title = 'Spirits | Spirits Night';
  loadHistory();
  window.addEventListener('storage', storageChanged);
});
onUnmounted(() => window.removeEventListener('storage', storageChanged));
</script>

<template>
  <div>
    <div class="relative -mx-4 mb-6 h-52 overflow-hidden">
      <img
        src="/images/spirits/spirits_splash.png"
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-depth-950/10 via-depth-950/55 to-depth-950"
      />
      <div class="absolute bottom-5 left-5">
        <h1 class="font-display text-3xl font-bold tracking-widest text-white uppercase">
          Spirits
        </h1>
        <p class="mt-1 text-sm text-slate-300">{{ spirits.length }} spirits to choose from</p>
      </div>
    </div>

    <section
      aria-labelledby="lineup-heading"
      class="mb-6 rounded-xl border border-teal-700/50 bg-depth-900 p-4 sm:p-5"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="lineup-heading" class="text-xl">Tonight’s lineup</h2>
        <span class="text-sm text-slate-400"
          >{{ pickedSpirits.length }}/{{ MAX_PLAYER_COUNT }} picked</span
        >
      </div>
      <p v-if="!pickedSpirits.length" class="mt-2 text-sm text-slate-300">
        Pick a Spirit below to start a lineup. You can change your mind at any time.
      </p>
      <ol v-else class="mt-3 flex flex-wrap gap-2">
        <li
          v-for="spirit in pickedSpirits"
          :key="spirit.slug"
          class="flex items-center gap-2 rounded-lg border border-teal-600/50 bg-teal-900/30 px-3 py-2 text-sm"
        >
          <span>{{ spirit.name }}</span>
          <button
            type="button"
            :aria-label="`Remove ${spirit.name} from lineup`"
            class="text-teal-200 underline hover:text-white"
            @click="removeSpirit(spirit.slug)"
          >
            Remove
          </button>
        </li>
      </ol>
      <RouterLink
        v-if="pickedSpirits.length"
        :to="{ path: '/plays', query: { spirits: pickedSlugs.join(',') } }"
        class="action-link mt-4 inline-flex"
        >Log a game with this lineup</RouterLink
      >
    </section>

    <section aria-labelledby="picker-heading">
      <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="picker-heading" class="text-xl">Choose Spirits</h2>
        <span class="text-sm text-slate-400"
          >{{ visibleSpirits.length }} shown · {{ eligibleSpirits.length }} available</span
        >
      </div>
      <p
        v-if="historyError"
        role="alert"
        class="mb-3 rounded-lg border border-amber-500/50 bg-amber-900/20 px-3 py-2 text-sm text-amber-200"
      >
        {{ historyError }} History filters are unavailable.
      </p>
      <div class="mb-3 flex flex-wrap gap-2" aria-label="Spirit filters">
        <button
          v-for="option in historyFilterOptions"
          :key="option.id"
          type="button"
          :aria-pressed="activeFilters.has(option.id)"
          :title="option.hint"
          :disabled="!historyReady"
          class="rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          :class="
            activeFilters.has(option.id)
              ? 'border-teal-400 bg-teal-900/60 text-teal-100'
              : 'border-depth-500 bg-depth-800 text-slate-200 hover:border-teal-500'
          "
          @click="toggleFilter(option.id)"
        >
          {{ option.label }}
        </button>
        <button
          type="button"
          :aria-pressed="shortlist !== null"
          class="rounded-full border px-3 py-1.5 text-sm transition-colors"
          :class="
            shortlist !== null
              ? 'border-teal-400 bg-teal-900/60 text-teal-100'
              : 'border-depth-500 bg-depth-800 text-slate-200 hover:border-teal-500'
          "
          @click="toggleShortlist"
        >
          Random shortlist
        </button>
      </div>
      <p class="mb-3 text-xs text-slate-400">
        History filters use this browser’s game log. Out of rotation means absent from the last
        {{ RECENT_GAME_COUNT }} games; go-tos have at least {{ GO_TO_MINIMUM_PLAYS }} plays.
      </p>
      <div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
        <span v-if="historyReady"
          >{{ plays.length }} logged {{ plays.length === 1 ? 'game' : 'games' }} ·
          {{ goToCount }} go-to {{ goToCount === 1 ? 'Spirit' : 'Spirits' }}</span
        >
        <span v-if="shortlist !== null">Dealt from the current filtered pool.</span>
        <button
          v-if="shortlist !== null"
          type="button"
          class="text-teal-300 underline hover:text-white"
          @click="shortlist = dealShortlist(eligibleSpirits)"
        >
          Reshuffle
        </button>
        <button
          v-if="hasFilters"
          type="button"
          class="text-teal-300 underline hover:text-white"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>

      <div
        v-if="pickedSpirits.length === MAX_PLAYER_COUNT"
        class="rounded-xl border border-teal-700/50 bg-depth-900 p-5 text-slate-200"
      >
        Lineup full. Remove a Spirit to pick another.
      </div>
      <div
        v-else-if="!visibleSpirits.length"
        class="rounded-xl border border-depth-600 bg-depth-800 p-5 text-slate-200"
      >
        <p>No Spirits match these filters.</p>
        <button
          v-if="hasFilters"
          type="button"
          class="mt-2 text-teal-300 underline hover:text-white"
          @click="clearFilters"
        >
          Show all available Spirits
        </button>
      </div>
      <ul
        v-else
        class="divide-y divide-depth-600/40 overflow-hidden rounded-xl border border-depth-600 bg-depth-800"
      >
        <li
          v-for="spirit in visibleSpirits"
          :key="spirit.id"
          class="flex items-center gap-3 px-4 py-3.5 sm:gap-4"
        >
          <img
            :src="`/images/spirits/${spirit.slug}/splash.png`"
            alt=""
            class="h-12 w-12 shrink-0 rounded-full border border-teal-600/20 object-cover"
          />
          <div class="min-w-0 flex-1">
            <RouterLink
              :to="`/spirit/${spirit.slug}`"
              target="_blank"
              class="font-display text-sm tracking-wide text-teal-400 hover:underline"
              >{{ spirit.name }}</RouterLink
            >
            <p class="text-sm text-slate-400">
              {{ spirit.complexity }} complexity · {{ spirit.expansion }}
            </p>
          </div>
          <button
            type="button"
            :aria-label="`Pick ${spirit.name}`"
            class="rounded-lg border border-teal-600/50 px-3 py-2 text-sm text-teal-200 hover:bg-teal-900/40"
            @click="pickSpirit(spirit.slug)"
          >
            Pick
          </button>
        </li>
      </ul>
    </section>

    <div class="mt-8 flex justify-center gap-3">
      <RouterLink to="/spirit/random" class="action-link">Random</RouterLink>
      <RouterLink to="/spirit/today" class="action-link">Today</RouterLink>
    </div>
  </div>
</template>
