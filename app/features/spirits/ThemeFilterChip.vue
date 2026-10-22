<script setup lang="ts">
import { themeStrengthLabel, type ThemeOption } from './picker';

defineProps<{
  option: ThemeOption;
  pickedCount: number;
  active: boolean;
  showDescription?: boolean;
}>();

const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <button
    type="button"
    :aria-pressed="active"
    :aria-label="
      pickedCount
        ? `${option.theme.label}: ${option.matchingPicks} of ${pickedCount} picks, ${option.availableCount} available`
        : `${option.theme.label}: ${option.availableCount} available`
    "
    :aria-description="option.theme.description"
    :disabled="option.availableCount === 0 && !active"
    class="flex flex-col gap-1 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
    :class="
      active
        ? 'border-amber-400 bg-amber-900/30 text-amber-100'
        : 'border-depth-500 bg-depth-800 text-slate-200 hover:border-amber-500'
    "
    @click="emit('toggle')"
  >
    <span class="font-semibold">{{ option.theme.label }}</span>
    <span v-if="pickedCount" class="flex items-center gap-2 text-xs text-slate-300">
      <span class="inline-flex gap-0.5" aria-hidden="true">
        <span
          v-for="slot in pickedCount"
          :key="slot"
          class="h-1.5 w-2 rounded-full"
          :class="slot <= option.matchingPicks ? 'bg-amber-300' : 'bg-depth-500'"
        />
      </span>
      {{ themeStrengthLabel(option.matchingPicks, pickedCount) }} · {{ option.matchingPicks }}/{{
        pickedCount
      }}
    </span>
    <span class="text-xs text-slate-400">{{ option.availableCount }} available</span>
    <span v-if="showDescription" class="text-xs text-slate-400">{{
      option.theme.description
    }}</span>
  </button>
</template>
