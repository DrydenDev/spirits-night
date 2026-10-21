<script setup lang="ts">
import { computed } from 'vue';
import { parseSpiritText } from './spiritText';

const props = defineProps<{ text: string | null | undefined }>();
const parts = computed(() => parseSpiritText(props.text));
</script>

<template>
  <span>
    <template v-for="(part, index) in parts" :key="index">
      <span
        v-if="part.kind === 'icon'"
        class="spirit-island-text"
        role="img"
        :aria-label="part.label"
        >{{ part.value }}</span
      >
      <strong v-else-if="part.kind === 'bold'">{{ part.value }}</strong>
      <em v-else-if="part.kind === 'italic'">{{ part.value }}</em>
      <template v-else>{{ part.value }}</template>
    </template>
  </span>
</template>
