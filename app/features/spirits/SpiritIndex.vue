<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getAllSpirits } from '~/models/Spirit';

const spirits = computed(() =>
  [...getAllSpirits()].sort((first, second) => first.name.localeCompare(second.name))
);

onMounted(() => {
  document.title = 'Spirits | Spirits Night';
});
</script>

<template>
  <div>
    <div class="relative -mx-4 h-52 mb-6 overflow-hidden">
      <img
        src="/images/spirits/spirits_splash.png"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-linear-to-b from-depth-950/10 via-depth-950/55 to-depth-950"
      />
      <div class="absolute bottom-5 left-5">
        <h1 class="font-display text-3xl font-bold text-white tracking-widest uppercase">
          Spirits
        </h1>
        <p class="text-slate-500 text-sm mt-1">{{ spirits.length }} spirits</p>
      </div>
    </div>

    <div
      class="bg-depth-800 border border-depth-600 rounded-xl overflow-hidden divide-y divide-depth-600/40"
    >
      <RouterLink
        v-for="spirit in spirits"
        :key="spirit.id"
        :to="`/spirit/${spirit.slug}`"
        class="flex items-center gap-4 px-4 py-3.5 hover:bg-depth-700/50 transition-colors"
      >
        <img
          :src="`/images/spirits/${spirit.slug}/splash.png`"
          :alt="spirit.name"
          class="w-12 h-12 rounded-full object-cover border border-teal-600/20 shrink-0"
        />
        <div class="min-w-0">
          <p class="font-display text-sm text-teal-400 tracking-wide truncate">{{ spirit.name }}</p>
          <p class="text-slate-500 text-sm">{{ spirit.complexity }} Complexity</p>
        </div>
      </RouterLink>
    </div>

    <div class="flex justify-center gap-3 mt-8">
      <RouterLink to="/spirit/random" class="action-link">Random</RouterLink>
      <RouterLink to="/spirit/today" class="action-link">Today</RouterLink>
    </div>
  </div>
</template>
