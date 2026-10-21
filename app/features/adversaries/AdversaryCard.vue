<script setup lang="ts">
import { computed } from 'vue';
import { DEFAULT_FEAR_CARDS } from '~/constants/game';
import SpiritText from '~/shared/SpiritText.vue';
import type { Adversary } from '~/types/domain';

const props = defineProps<{ adversary: Adversary; level: number }>();
const activeLevels = computed(() =>
  [...props.adversary.levels]
    .filter((row) => row.level <= props.level)
    .sort((first, second) => first.level - second.level)
);
const fearCards = computed(
  () =>
    props.adversary.levels.find((row) => row.level === props.level)?.fearCards ?? DEFAULT_FEAR_CARDS
);
</script>

<template>
  <div
    class="bg-depth-800 border border-depth-600 rounded-xl overflow-hidden flex flex-col gap-3 p-4"
  >
    <div
      v-if="adversary.lossCondition"
      class="border-l-4 border-red-500 bg-red-900/15 rounded-r-lg px-4 py-3"
    >
      <p class="font-display text-xs uppercase tracking-widest text-red-400 mb-1">
        Additional loss condition
      </p>
      <p class="text-slate-200 text-base leading-relaxed">
        <strong class="text-red-300">{{ adversary.lossCondition.title }}:</strong>{{ ' ' }}
        <SpiritText :text="adversary.lossCondition.description" />
      </p>
    </div>

    <div class="border-l-4 border-amber-500 bg-amber-900/15 rounded-r-lg px-4 py-3">
      <p class="font-display text-xs uppercase tracking-widest text-amber-400 mb-1">Escalation</p>
      <p class="text-slate-200 text-base leading-relaxed">
        <strong class="text-amber-300">{{ adversary.escalationAbility.title }}:</strong>{{ ' ' }}
        <SpiritText :text="adversary.escalationAbility.description" />
      </p>
    </div>

    <div class="rounded-lg overflow-hidden border border-teal-700/25">
      <div class="bg-teal-900/40 border-b border-teal-700/25 px-4 py-2">
        <h2 class="font-display text-xs uppercase tracking-widest text-teal-400">Fear cards</h2>
      </div>
      <div class="px-4 py-3 text-slate-200 text-lg tabular-nums">{{ fearCards }}</div>
    </div>

    <ul v-if="activeLevels.length" class="divide-y divide-depth-600/40">
      <li v-for="row in activeLevels" :key="row.id" class="py-3 first:pt-0 last:pb-0">
        <h2 class="font-semibold text-slate-100 mb-0.5">{{ row.title }}</h2>
        <p class="text-slate-300 text-base leading-relaxed">
          <SpiritText :text="row.description" />
        </p>
      </li>
    </ul>
  </div>
</template>
