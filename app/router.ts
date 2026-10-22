import { createRouter, createWebHistory } from 'vue-router';
import type { RouterHistory } from 'vue-router';
import AdversaryIndex from '~/features/adversaries/AdversaryIndex.vue';
import AdversaryDetail from '~/features/adversaries/AdversaryDetail.vue';
import SpiritIndex from '~/features/spirits/SpiritIndex.vue';
import SpiritDetail from '~/features/spirits/SpiritDetail.vue';
import NotFound from '~/shared/NotFound.vue';
import PlayLog from '~/features/plays/PlayLog.vue';
import { resolveAdversaryShortcut } from '~/features/adversaries/selection';
import { resolveSpiritShortcut } from '~/features/spirits/selection';

export function createSpiritsRouter(history: RouterHistory = createWebHistory()) {
  return createRouter({
    history,
    routes: [
      { path: '/', redirect: '/adversary' },
      { path: '/adversary', component: AdversaryIndex },
      {
        path: '/adversary/random/:level?',
        redirect: (to) =>
          resolveAdversaryShortcut('random', to.params.level as string | undefined) ?? '/adversary',
      },
      {
        path: '/adversary/today/:level?',
        redirect: (to) =>
          resolveAdversaryShortcut('today', to.params.level as string | undefined) ?? '/adversary',
      },
      {
        path: '/adversary/:slug/:level?',
        component: AdversaryDetail,
      },
      { path: '/spirit', component: SpiritIndex },
      { path: '/spirit/random', redirect: () => resolveSpiritShortcut('random') ?? '/spirit' },
      { path: '/spirit/today', redirect: () => resolveSpiritShortcut('today') ?? '/spirit' },
      {
        path: '/spirit/:slug',
        component: SpiritDetail,
      },
      { path: '/plays', component: PlayLog },
      { path: '/:pathMatch(.*)*', component: NotFound },
    ],
    scrollBehavior: () => ({ top: 0 }),
  });
}

export const router = createSpiritsRouter();
