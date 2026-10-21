<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import SpiritText from '~/shared/SpiritText.vue';
import type { Adversary } from '~/types/domain';
import { PHASE_ORDER, referencesAtLevel } from './reference';

const props = defineProps<{ adversary: Adversary; level: number }>();
const dismissedSetup = ref(false);
watch(
  () => [props.adversary.slug, props.level],
  () => {
    dismissedSetup.value = false;
  }
);

const phaseGroups = computed(() => {
  const active = referencesAtLevel(props.adversary.references, props.level);
  return PHASE_ORDER.map((phase) => ({
    phase,
    rules: active.filter((rule) => rule.phase.toUpperCase() === phase.toUpperCase()),
  })).filter(
    (group) => group.rules.length > 0 && (group.phase !== 'Setup' || !dismissedSetup.value)
  );
});
</script>

<template>
  <div
    class="bg-depth-800 border border-depth-600 rounded-xl overflow-hidden divide-y divide-depth-600/40"
  >
    <details v-for="group in phaseGroups" :key="group.phase" open class="group">
      <summary
        class="flex items-center justify-between cursor-pointer px-4 py-3.5 hover:bg-depth-700/40 transition-colors select-none"
      >
        <span class="font-display text-xs uppercase tracking-widest text-teal-300">{{
          group.phase
        }}</span>
        <span aria-hidden="true" class="text-teal-500">⌄</span>
      </summary>
      <div class="px-4 pb-4 flex flex-col gap-3">
        <div
          v-for="rule in group.rules"
          :key="rule.id"
          :class="[
            rule.type === 'Loss Condition'
              ? 'border-l-4 border-red-500 bg-red-900/15 rounded-r-lg px-4 py-3'
              : '',
            rule.type === 'Escalation'
              ? 'border-l-4 border-amber-500 bg-amber-900/15 rounded-r-lg px-4 py-3'
              : '',
          ]"
        >
          <h3 class="font-semibold text-slate-100 mb-0.5">{{ rule.title }}</h3>
          <p class="text-slate-300 text-base leading-relaxed">
            <SpiritText :text="rule.description" />
          </p>
        </div>
        <button
          v-if="group.phase === 'Setup'"
          type="button"
          class="action-link self-center"
          @click="dismissedSetup = true"
        >
          Dismiss setup
        </button>
      </div>
    </details>
  </div>
</template>
