<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';

onMounted(() => {
  document.title = 'Page not found | Spirits Night';
});
</script>

<template>
  <section class="text-center py-20">
    <h1 class="font-display text-2xl mb-4">Page not found</h1>
    <p class="text-slate-400 mb-6">That spirit or adversary is not in this reference.</p>
    <RouterLink to="/adversary" class="action-link">Browse adversaries</RouterLink>
  </section>
</template>
