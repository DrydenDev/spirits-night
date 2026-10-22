<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getAllAdversaries } from '~/models/Adversary';
import { getAllSpirits } from '~/models/Spirit';
import { MAX_PLAYER_COUNT, MIN_PLAYER_COUNT, validatePlayInput } from './storage';
import type { Play, PlayInput } from './types';

const props = defineProps<{
  editingPlay: Play | null;
  prefill?: Partial<Pick<PlayInput, 'adversarySlug' | 'level' | 'spiritSlugs'>>;
}>();
const emit = defineEmits<{
  save: [value: PlayInput];
  cancel: [];
}>();

const adversaries = [...getAllAdversaries()].sort((first, second) =>
  first.name.localeCompare(second.name)
);
const spirits = [...getAllSpirits()].sort((first, second) => first.name.localeCompare(second.name));

function localToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function blankPlay(): PlayInput {
  const adversarySlug = props.prefill?.adversarySlug ?? adversaries[0].slug;
  const adversary = adversaries.find((item) => item.slug === adversarySlug) ?? adversaries[0];
  return {
    date: localToday(),
    adversarySlug: adversary.slug,
    level: props.prefill?.level ?? adversary.levels[0].level,
    spiritSlugs: [...(props.prefill?.spiritSlugs ?? [''])],
    playerCount: props.prefill?.spiritSlugs?.length ?? MIN_PLAYER_COUNT,
    result: 'win',
    feltDifficulty: 'right',
  };
}

const draft = ref<PlayInput>(blankPlay());
const formError = ref('');
const selectedAdversary = computed(() =>
  adversaries.find((adversary) => adversary.slug === draft.value.adversarySlug)
);
const levels = computed(() => selectedAdversary.value?.levels ?? []);
const selectedDifficulty = computed(
  () => levels.value.find((level) => level.level === draft.value.level)?.difficulty
);

watch(
  () => props.editingPlay,
  (play) => {
    draft.value = play ? { ...play, spiritSlugs: [...play.spiritSlugs] } : blankPlay();
    formError.value = '';
  }
);

function changeAdversary(): void {
  draft.value.level = levels.value[0]?.level ?? 0;
}

function addSpirit(): void {
  if (draft.value.spiritSlugs.length < MAX_PLAYER_COUNT) draft.value.spiritSlugs.push('');
}

function removeSpirit(index: number): void {
  if (draft.value.spiritSlugs.length > MIN_PLAYER_COUNT) draft.value.spiritSlugs.splice(index, 1);
}

function submit(): void {
  if (!validatePlayInput(draft.value)) {
    formError.value =
      'Choose a valid date, adversary, level, and unique spirit for every lineup slot.';
    return;
  }
  formError.value = '';
  emit('save', { ...draft.value, spiritSlugs: [...draft.value.spiritSlugs] });
}

function reset(): void {
  draft.value = blankPlay();
  formError.value = '';
}

defineExpose({ reset });
</script>

<template>
  <section
    class="rounded-xl border border-depth-500 bg-depth-800 p-5 sm:p-6"
    aria-labelledby="play-form-heading"
  >
    <div class="flex items-baseline justify-between gap-3 mb-5">
      <h2 id="play-form-heading" class="text-xl">
        {{ editingPlay ? 'Edit game' : 'Record a game' }}
      </h2>
      <span v-if="selectedDifficulty !== undefined" class="text-sm text-teal-300">
        Difficulty {{ selectedDifficulty }}
      </span>
    </div>
    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="play-date" class="field-label">Date played</label>
          <input id="play-date" v-model="draft.date" type="date" required class="field-input" />
        </div>
        <div>
          <label for="play-players" class="field-label">Players</label>
          <input
            id="play-players"
            v-model.number="draft.playerCount"
            type="number"
            :min="MIN_PLAYER_COUNT"
            :max="MAX_PLAYER_COUNT"
            required
            class="field-input"
          />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
        <div>
          <label for="play-adversary" class="field-label">Adversary</label>
          <select
            id="play-adversary"
            v-model="draft.adversarySlug"
            class="field-input"
            @change="changeAdversary"
          >
            <option v-for="adversary in adversaries" :key="adversary.slug" :value="adversary.slug">
              {{ adversary.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="play-level" class="field-label">Level</label>
          <select id="play-level" v-model.number="draft.level" class="field-input">
            <option v-for="level in levels" :key="level.level" :value="level.level">
              {{ level.level }} · difficulty {{ level.difficulty }}
            </option>
          </select>
        </div>
      </div>

      <fieldset>
        <legend class="field-label">Spirit lineup</legend>
        <p class="text-sm text-slate-400 mb-2">
          Add each spirit played, including extra spirits in solo games.
        </p>
        <div class="space-y-2">
          <div v-for="(_slug, index) in draft.spiritSlugs" :key="index" class="flex gap-2">
            <label :for="`play-spirit-${index}`" class="sr-only">Spirit {{ index + 1 }}</label>
            <select
              :id="`play-spirit-${index}`"
              v-model="draft.spiritSlugs[index]"
              class="field-input min-w-0"
            >
              <option value="">Choose spirit {{ index + 1 }}</option>
              <option v-for="spirit in spirits" :key="spirit.slug" :value="spirit.slug">
                {{ spirit.name }}
              </option>
            </select>
            <button
              v-if="draft.spiritSlugs.length > MIN_PLAYER_COUNT"
              type="button"
              class="action-link shrink-0"
              :aria-label="`Remove spirit ${index + 1}`"
              @click="removeSpirit(index)"
            >
              Remove
            </button>
          </div>
        </div>
        <button
          v-if="draft.spiritSlugs.length < MAX_PLAYER_COUNT"
          type="button"
          class="text-sm text-teal-300 hover:text-teal-200 mt-3"
          @click="addSpirit"
        >
          + Add another spirit
        </button>
      </fieldset>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="play-result" class="field-label">Result</label>
          <select id="play-result" v-model="draft.result" class="field-input">
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </div>
        <div>
          <label for="play-feel" class="field-label">How did it feel?</label>
          <select id="play-feel" v-model="draft.feltDifficulty" class="field-input">
            <option value="easy">Too easy</option>
            <option value="right">About right</option>
            <option value="hard">Too hard</option>
          </select>
        </div>
      </div>

      <p v-if="formError" role="alert" class="text-sm text-red-300">{{ formError }}</p>
      <div class="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          class="action-link border-teal-600 bg-teal-900/30 text-teal-100 hover:bg-teal-900/50"
        >
          {{ editingPlay ? 'Save changes' : 'Save game' }}
        </button>
        <button v-if="editingPlay" type="button" class="action-link" @click="emit('cancel')">
          Cancel edit
        </button>
      </div>
    </form>
  </section>
</template>
