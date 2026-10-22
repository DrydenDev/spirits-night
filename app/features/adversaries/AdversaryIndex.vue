<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getAllAdversaries } from '~/models/Adversary';
import { communityAdversaries } from './communityAdversaries';
import { PLAYTEST_CONFIDENCE_LABELS } from './playtest';

const adversaries = computed(() =>
  getAllAdversaries()
    .filter((adversary) => !adversary.sourceUrl)
    .sort((first, second) => first.name.localeCompare(second.name))
);

onMounted(() => {
  document.title = 'Adversaries | Spirits Night';
});

function difficultyRange(difficulties: number[]): string {
  return `${Math.min(...difficulties)}–${Math.max(...difficulties)}`;
}
</script>

<template>
  <div>
    <div class="relative -mx-4 h-52 mb-6 overflow-hidden">
      <img
        src="/images/adversaries/adversary_splash.jpg"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-depth-950/10 via-depth-950/55 to-depth-950"
      />
      <div class="absolute bottom-5 left-5">
        <h1 class="font-display text-3xl font-bold text-white tracking-widest uppercase">
          Adversaries
        </h1>
        <p class="text-slate-500 text-sm mt-1">{{ adversaries.length }} adversaries</p>
      </div>
    </div>

    <div
      class="bg-depth-800 border border-depth-600 rounded-xl overflow-hidden divide-y divide-depth-600/40"
    >
      <RouterLink
        v-for="adversary in adversaries"
        :key="adversary.id"
        :to="`/adversary/${adversary.slug}`"
        class="flex items-center gap-4 px-4 py-3.5 hover:bg-depth-700/50 transition-colors"
      >
        <img
          :src="`/images/adversaries/${adversary.slug}/avatar.png`"
          :alt="adversary.name"
          class="w-12 h-12 rounded-full object-cover border border-depth-500/60 shrink-0"
        />
        <div class="min-w-0">
          <p class="font-display text-sm text-teal-400 tracking-wide truncate">
            {{ adversary.name }}
          </p>
          <p class="text-slate-500 text-sm">
            Difficulty
            {{
              difficultyRange([
                adversary.difficulty,
                ...adversary.levels.map((level) => level.difficulty),
              ])
            }}
          </p>
        </div>
      </RouterLink>
    </div>

    <div class="flex justify-center gap-3 mt-8">
      <RouterLink to="/adversary/random" class="action-link">Random</RouterLink>
      <RouterLink to="/adversary/today" class="action-link">Today</RouterLink>
    </div>

    <section aria-labelledby="community-adversaries-title" class="mt-12">
      <h2 id="community-adversaries-title" class="font-display text-xl text-white tracking-wide">
        Community adversaries
      </h2>
      <p class="text-sm text-slate-400 mt-2 mb-4">
        Fan-made adversaries with in-app rules and links to their original cards. Playtest evidence
        varies by design.
      </p>
      <div class="grid gap-4 md:grid-cols-2">
        <article
          v-for="entry in communityAdversaries"
          :key="entry.name"
          class="bg-depth-800 border border-depth-600 rounded-xl p-5"
        >
          <h3 class="font-display text-teal-400 tracking-wide">{{ entry.name }}</h3>
          <p class="text-xs text-slate-500 mt-1">By {{ entry.creator }} · Fan-made</p>
          <p class="text-sm text-slate-300 mt-3">{{ entry.impressions }}</p>
          <p v-if="entry.playtestConfidence" class="text-xs text-teal-300 mt-3">
            {{ PLAYTEST_CONFIDENCE_LABELS[entry.playtestConfidence] }}
          </p>
          <div class="flex flex-wrap gap-3 mt-4">
            <RouterLink :to="`/adversary/${entry.slug}`" class="action-link">
              View rules
            </RouterLink>
            <a :href="entry.sourceUrl" target="_blank" rel="noopener noreferrer" class="action-link"
              >Original rules</a
            >
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
