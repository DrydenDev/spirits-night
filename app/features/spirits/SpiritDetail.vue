<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { getSpiritBySlug } from '~/models/Spirit';
import NotFound from '~/shared/NotFound.vue';
import SpiritText from '~/shared/SpiritText.vue';
import SpiritChart from './SpiritChart.vue';

const route = useRoute();
const spirit = computed(() => getSpiritBySlug(String(route.params.slug ?? '')));
const status = ref('');

watch(
  spirit,
  (value) => {
    document.title = value ? `${value.name} | Spirits Night` : 'Spirit not found | Spirits Night';
  },
  { immediate: true }
);

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
  <NotFound v-if="!spirit" />
  <div v-else>
    <div class="relative -mx-4 h-60 mb-6 overflow-hidden">
      <img
        :src="`/images/spirits/${spirit.slug}/splash.png`"
        :alt="spirit.name"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-linear-to-b from-transparent via-depth-950/40 to-depth-950" />
      <div class="absolute bottom-4 left-5 right-5">
        <h1
          class="font-display text-2xl font-bold text-white tracking-widest uppercase leading-tight"
        >
          {{ spirit.name }}
        </h1>
      </div>
    </div>

    <div class="flex flex-col gap-5">
      <section
        v-if="spirit.playstyle"
        class="rounded-xl overflow-hidden border border-depth-600 max-w-xl mx-auto w-full"
      >
        <div class="px-4 py-2.5 border-b border-white/10 bg-teal-900/40">
          <h2 class="font-display text-xs uppercase tracking-widest text-teal-200">Playstyle</h2>
        </div>
        <div class="bg-depth-800 px-4 py-4">
          <p class="text-slate-200 whitespace-pre-wrap text-base leading-relaxed">
            <SpiritText :text="spirit.playstyle" />
          </p>
        </div>
      </section>

      <SpiritChart :spirit="spirit" />

      <div class="flex flex-wrap justify-center gap-2">
        <span class="tag bg-teal-900/30 border-teal-600/40 text-teal-300"
          >{{ spirit.complexity }} Complexity</span
        >
        <span class="tag bg-depth-700 border-depth-500 text-slate-400">{{ spirit.expansion }}</span>
        <span v-if="spirit.incarna" class="tag bg-amber-900/30 border-amber-500/40 text-amber-300"
          >Incarna</span
        >
      </div>

      <div class="flex flex-wrap justify-center gap-3 py-2">
        <RouterLink to="/spirit/random" class="action-link">Random</RouterLink>
        <button type="button" class="action-link" @click="copyPermalink">Permalink</button>
        <RouterLink to="/spirit/today" class="action-link">Today</RouterLink>
        <RouterLink :to="{ path: '/plays', query: { spirit: spirit.slug } }" class="action-link"
          >Log a play</RouterLink
        >
      </div>
      <p v-if="status" role="status" class="text-center text-sm text-slate-300">{{ status }}</p>
    </div>
  </div>
</template>
