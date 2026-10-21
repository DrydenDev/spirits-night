<script setup lang="ts">
import { computed } from 'vue';
import { ATTRIBUTE_MAX_SCORE } from '~/constants/game';
import type { Spirit } from '~/types/domain';

const props = defineProps<{ spirit: Spirit }>();
const attributes = computed(() => [
  { label: 'Offense', value: props.spirit.offense },
  { label: 'Control', value: props.spirit.control },
  { label: 'Fear', value: props.spirit.fear },
  { label: 'Defense', value: props.spirit.defense },
  { label: 'Utility', value: props.spirit.utility },
]);

function barWidth(value: number): string {
  return `${(Math.max(0, Math.min(value, ATTRIBUTE_MAX_SCORE)) / ATTRIBUTE_MAX_SCORE) * 100}%`;
}
</script>

<template>
  <section
    class="bg-depth-800 border border-depth-600 rounded-xl p-5 max-w-md mx-auto w-full"
    aria-label="Spirit attributes"
  >
    <div
      v-for="attribute in attributes"
      :key="attribute.label"
      class="grid grid-cols-[6rem_1fr_1.5rem] gap-3 items-center py-2"
    >
      <span class="font-display text-xs text-slate-200">{{ attribute.label }}</span>
      <div
        role="meter"
        :aria-label="attribute.label"
        :aria-valuenow="attribute.value"
        :aria-valuemin="0"
        :aria-valuemax="ATTRIBUTE_MAX_SCORE"
        class="h-3 bg-depth-600 rounded-full overflow-hidden"
      >
        <div
          class="h-full rounded-full bg-teal-400"
          :style="{ width: barWidth(attribute.value) }"
        />
      </div>
      <span class="text-sm text-slate-300 tabular-nums text-right">{{ attribute.value }}</span>
    </div>
  </section>
</template>
