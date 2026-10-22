<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  ADVERSARY_MAX_LEVEL,
  ADVERSARY_MIN_LEVEL,
  DIFFICULTY_ERROR_THRESHOLD,
  DIFFICULTY_WARNING_THRESHOLD,
} from '~/constants/game';
import { getAdversaryBySlug } from '~/models/Adversary';
import NotFound from '~/shared/NotFound.vue';
import AdversaryCard from './AdversaryCard.vue';
import AdversaryReference from './AdversaryReference.vue';
import CommunityAdversarySheet from './CommunityAdversarySheet.vue';
import { PLAYTEST_CONFIDENCE_LABELS } from './playtest';
import { parseAdversaryLevel } from './selection';

const route = useRoute();
const router = useRouter();
const slug = computed(() => String(route.params.slug ?? ''));
const adversary = computed(() => getAdversaryBySlug(slug.value));
const maxLevel = computed(() => adversary.value?.levels.at(-1)?.level ?? ADVERSARY_MAX_LEVEL);
const routeLevel = computed(
  () =>
    parseAdversaryLevel(route.params.level as string | undefined, maxLevel.value) ?? maxLevel.value
);
const selectedLevel = ref(routeLevel.value);
const currentTab = ref<'card' | 'reference' | 'full-card'>('card');
const status = ref('');
const levels = computed(() =>
  Array.from({ length: maxLevel.value - ADVERSARY_MIN_LEVEL + 1 }, (_, index) => index)
);

watch(routeLevel, (level) => {
  selectedLevel.value = level;
});
watch(
  adversary,
  (value) => {
    document.title = value
      ? `${value.name} — Level ${selectedLevel.value} | Spirits Night`
      : 'Adversary not found | Spirits Night';
  },
  { immediate: true }
);
watch(selectedLevel, (level) => {
  if (adversary.value) document.title = `${adversary.value.name} — Level ${level} | Spirits Night`;
});

const difficulty = computed(
  () => adversary.value?.levels.find((row) => row.level === selectedLevel.value)?.difficulty
);
const difficultyClass = computed(() => {
  if (difficulty.value === undefined) return '';
  if (difficulty.value > DIFFICULTY_ERROR_THRESHOLD)
    return 'bg-red-900/30 border-red-500/40 text-red-300';
  if (difficulty.value > DIFFICULTY_WARNING_THRESHOLD)
    return 'bg-amber-900/30 border-amber-500/40 text-amber-300';
  return 'bg-green-900/30 border-green-600/40 text-green-300';
});

function commitLevel(): void {
  if (!adversary.value) return;
  void router.replace(`/adversary/${adversary.value.slug}/${selectedLevel.value}`);
}

async function copyPermalink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    status.value = 'Permalink copied';
  } catch (error) {
    console.error({ event: 'permalink_copy_failed', error });
    status.value = 'Could not copy the link. Copy it from the address bar instead.';
  }
}
</script>

<template>
  <NotFound v-if="!adversary" />
  <div v-else>
    <div class="relative -mx-4 h-44 mb-6 overflow-hidden">
      <img
        v-if="!adversary.sourceUrl"
        :src="`/images/adversaries/${adversary.slug}/banner.png`"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-depth-950/10 via-depth-950/50 to-depth-950"
      />
      <div class="absolute bottom-4 left-5">
        <h1 class="font-display text-2xl font-bold text-white tracking-widest uppercase">
          {{ adversary.name }}
        </h1>
      </div>
    </div>

    <div class="flex flex-col gap-5">
      <div class="px-1">
        <label for="adversary-level" class="sr-only">Adversary level</label>
        <input
          id="adversary-level"
          v-model.number="selectedLevel"
          type="range"
          :min="ADVERSARY_MIN_LEVEL"
          :max="maxLevel"
          class="w-full accent-teal-400"
          @change="commitLevel"
        />
        <div class="flex justify-between px-0.5">
          <span
            v-for="level in levels"
            :key="level"
            class="text-xs font-display"
            :class="level === selectedLevel ? 'text-teal-400' : 'text-slate-600'"
            >{{ level }}</span
          >
        </div>
      </div>

      <div role="group" aria-label="Adversary view" class="flex border-b border-depth-600">
        <button
          type="button"
          :aria-pressed="currentTab === 'card'"
          class="detail-tab"
          :class="currentTab === 'card' ? 'detail-tab-active' : ''"
          @click="currentTab = 'card'"
        >
          Breakdown
        </button>
        <button
          type="button"
          :aria-pressed="currentTab === 'reference'"
          class="detail-tab"
          :class="currentTab === 'reference' ? 'detail-tab-active' : ''"
          @click="currentTab = 'reference'"
        >
          Reference
        </button>
        <button
          v-if="adversary.sourceUrl"
          type="button"
          :aria-pressed="currentTab === 'full-card'"
          class="detail-tab"
          :class="currentTab === 'full-card' ? 'detail-tab-active' : ''"
          @click="currentTab = 'full-card'"
        >
          Adversary card
        </button>
      </div>

      <section
        :aria-label="
          currentTab === 'card'
            ? 'Adversary breakdown'
            : currentTab === 'reference'
              ? 'Gameplay reference'
              : 'Community adversary card'
        "
      >
        <AdversaryCard v-if="currentTab === 'card'" :adversary="adversary" :level="selectedLevel" />
        <AdversaryReference
          v-else-if="currentTab === 'reference'"
          :adversary="adversary"
          :level="selectedLevel"
        />
        <CommunityAdversarySheet v-else :adversary="adversary" :level="selectedLevel" />
      </section>

      <div class="flex flex-wrap justify-center gap-2">
        <span class="tag bg-teal-900/30 border-teal-600/40 text-teal-300"
          >Level {{ selectedLevel }}</span
        >
        <span v-if="difficulty !== undefined" class="tag" :class="difficultyClass"
          >Difficulty {{ difficulty }}</span
        >
        <span class="tag bg-depth-700 border-depth-500 text-slate-400">{{
          adversary.expansion
        }}</span>
      </div>

      <div v-if="adversary.sourceUrl" class="text-center text-sm text-slate-400">
        <p>Fan-made by {{ adversary.creator }}. {{ adversary.sourceNote }}</p>
        <a
          :href="adversary.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-teal-400 underline inline-block mt-2"
          >Original rules</a
        >
        <a
          v-if="adversary.discussionUrl"
          :href="adversary.discussionUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-teal-400 underline inline-block mt-2 ml-4"
          >Discussion and play notes</a
        >
      </div>

      <section
        v-if="adversary.playtestConfidence"
        aria-label="Community playtest assessment"
        class="bg-depth-800 border border-depth-600 rounded-xl p-4 text-sm text-slate-300 space-y-3"
      >
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="font-display text-base text-white">Table impressions</h2>
          <span class="tag bg-teal-900/30 border-teal-600/40 text-teal-300">
            {{ PLAYTEST_CONFIDENCE_LABELS[adversary.playtestConfidence] }}
          </span>
        </div>
        <p>{{ adversary.impressions }}</p>
        <p>
          <strong class="text-slate-100">Playtest evidence:</strong>
          {{ adversary.playtestEvidence }}
        </p>
        <p><strong class="text-slate-100">Balance:</strong> {{ adversary.balanceNote }}</p>
        <div v-if="adversary.playNotes?.length">
          <h3 class="font-semibold text-slate-100">Play notes</h3>
          <ul class="list-disc pl-5 mt-1 space-y-1">
            <li v-for="note in adversary.playNotes" :key="note">{{ note }}</li>
          </ul>
        </div>
      </section>

      <div class="flex flex-wrap justify-center gap-3 py-2">
        <RouterLink to="/adversary/random" class="action-link">Random</RouterLink>
        <button type="button" class="action-link" @click="copyPermalink">Permalink</button>
        <RouterLink to="/adversary/today" class="action-link">Today</RouterLink>
        <RouterLink
          :to="{ path: '/plays', query: { adversary: adversary.slug, level: selectedLevel } }"
          class="action-link"
          >Log a play</RouterLink
        >
      </div>
      <p v-if="status" role="status" class="text-center text-sm text-slate-300">{{ status }}</p>
    </div>
  </div>
</template>
