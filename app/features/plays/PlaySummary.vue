<script setup lang="ts">
import { computed } from 'vue';
import {
  calibrateDifficulty,
  CALIBRATION_WINDOW,
  difficultyForPlay,
  summarizeByDifficulty,
} from './summary';
import type { Play } from './types';

const props = defineProps<{ plays: Play[] }>();
const calibration = computed(() => calibrateDifficulty(props.plays));
const bands = computed(() => summarizeByDifficulty(props.plays));
const wins = computed(() => props.plays.filter((play) => play.result === 'win').length);

const guidance = computed(() => {
  const result = calibration.value;
  if (result.direction === 'insufficient') {
    return `Record ${CALIBRATION_WINDOW - result.recentPlays.length} more ${CALIBRATION_WINDOW - result.recentPlays.length === 1 ? 'game' : 'games'} to get a difficulty suggestion.`;
  }
  if (result.direction === 'raise')
    return `Three easy wins in a row. Try difficulty ${result.target} next.`;
  if (result.direction === 'lower')
    return `Three hard losses in a row. Try difficulty ${result.target} next.`;
  return `Recent results are mixed. Stay near difficulty ${result.target} for now.`;
});
</script>

<template>
  <section
    aria-labelledby="calibration-heading"
    class="rounded-xl border border-teal-700/50 bg-depth-900 p-5 sm:p-6"
  >
    <h2 id="calibration-heading" class="text-xl mb-2">Finding your level</h2>
    <p class="text-slate-200">{{ guidance }}</p>
    <p class="text-sm text-slate-400 mt-2">
      Based on {{ calibration.recentPlays.length }}
      {{ calibration.recentPlays.length === 1 ? 'game' : 'games' }}. A suggestion, not a rule.
    </p>

    <template v-if="plays.length">
      <div class="border-t border-depth-600 mt-5 pt-5">
        <p class="text-sm text-slate-300 mb-3">
          {{ wins }} {{ wins === 1 ? 'win' : 'wins' }} in {{ plays.length }} recorded
          {{ plays.length === 1 ? 'game' : 'games' }}
        </p>
        <h3 class="text-base mb-3">By difficulty rating</h3>
        <ul class="space-y-2">
          <li
            v-for="band in bands"
            :key="band.difficulty"
            class="grid grid-cols-[auto_1fr] sm:grid-cols-[6rem_1fr_auto] gap-x-3 gap-y-1 border-b border-depth-600/70 pb-2 text-sm"
          >
            <span class="text-teal-300 font-semibold">Difficulty {{ band.difficulty }}</span>
            <span
              >{{ band.wins }}/{{ band.games }} wins · {{ band.games }}
              {{ band.games === 1 ? 'game' : 'games' }}</span
            >
            <span class="col-start-2 sm:col-start-auto text-slate-400"
              >{{ band.easy }} easy · {{ band.right }} right · {{ band.hard }} hard</span
            >
          </li>
        </ul>
      </div>
      <details class="mt-4 text-sm text-slate-400">
        <summary class="cursor-pointer text-teal-300">Games behind this suggestion</summary>
        <ul class="mt-2 pl-5 list-disc space-y-1">
          <li v-for="play in calibration.recentPlays" :key="play.id">
            {{ play.date }} · difficulty {{ difficultyForPlay(play) }} · {{ play.result }} ·
            {{ play.feltDifficulty }}
          </li>
        </ul>
      </details>
    </template>
  </section>
</template>
