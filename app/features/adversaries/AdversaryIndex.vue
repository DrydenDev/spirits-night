<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getAllAdversaries } from '~/models/Adversary';

const adversaries = computed(() =>
  [...getAllAdversaries()].sort((first, second) => first.name.localeCompare(second.name))
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
  </div>
</template>
