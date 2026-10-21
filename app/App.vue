<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import SpiritText from '~/shared/SpiritText.vue';

const route = useRoute();

function isSectionActive(sectionPath: string): boolean {
  return route.path === sectionPath || route.path.startsWith(`${sectionPath}/`);
}
</script>

<template>
  <div class="min-h-screen">
    <nav class="sticky top-0 z-50 bg-depth-900/95 backdrop-blur-sm border-b border-depth-600">
      <div class="max-w-3xl mx-auto px-4 py-4 flex justify-around items-center">
        <RouterLink
          to="/adversary"
          class="nav-link"
          :class="{ 'nav-link-active': isSectionActive('/adversary') }"
        >
          <SpiritText text="[[Explorer]]" class="text-base leading-none" />
          <span>Adversaries</span>
        </RouterLink>
        <RouterLink
          to="/spirit"
          class="nav-link"
          :class="{ 'nav-link-active': isSectionActive('/spirit') }"
        >
          <SpiritText text="[[Presence]]" class="text-base leading-none" />
          <span>Spirits</span>
        </RouterLink>
      </div>
    </nav>
    <main class="max-w-3xl mx-auto px-4 pb-16">
      <RouterView />
    </main>
  </div>
</template>
