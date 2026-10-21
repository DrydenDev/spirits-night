import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory } from 'vue-router';
import { createSpiritsRouter } from './router';
import AdversaryDetail from './features/adversaries/AdversaryDetail.vue';
import App from './App.vue';
import { getAllAdversaries } from './models/Adversary';
import { getAllSpirits } from './models/Spirit';
import { ADVERSARY_MAX_LEVEL, ADVERSARY_MIN_LEVEL } from './constants/game';

describe('permalink routes', () => {
  beforeEach(() => vi.stubGlobal('scrollTo', vi.fn()));
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('opens an existing adversary and level directly', async () => {
    const router = createSpiritsRouter(createMemoryHistory());
    await router.push('/adversary/england/4');
    expect(router.currentRoute.value.path).toBe('/adversary/england/4');
  });

  it('lists every adversary and spirit for browsing', async () => {
    const router = createSpiritsRouter(createMemoryHistory());
    await router.push('/adversary');
    const wrapper = mount(App, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.get('h1').text()).toBe('Adversaries');
    expect(wrapper.findAll('a[href^="/adversary/"]').length).toBe(getAllAdversaries().length + 2);

    await router.push('/spirit');
    await flushPromises();
    expect(wrapper.get('h1').text()).toBe('Spirits');
    expect(wrapper.findAll('a[href^="/spirit/"]').length).toBe(getAllSpirits().length + 2);

    await router.push('/spirit/river');
    await flushPromises();
    expect(wrapper.get('a[href="/spirit"]').classes()).toContain('nav-link-active');
    expect(wrapper.get('a[href="/adversary"]').classes()).not.toContain('nav-link-active');
  });

  it('shows a useful error for an unknown spirit', async () => {
    const router = createSpiritsRouter(createMemoryHistory());
    await router.push('/spirit/unknown-spirit');
    const wrapper = mount(App, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.get('h1').text()).toBe('Page not found');
    expect(wrapper.get('a[href="/adversary"]').text()).toContain('Adversaries');
  });

  it('redirects daily shortcuts to stable URLs', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 12));
    const router = createSpiritsRouter(createMemoryHistory());
    await router.push('/adversary/england/4');
    await router.push('/adversary/today');
    expect(router.currentRoute.value.path).toBe('/adversary/bradenburg-prussia/3');
    await router.push('/spirit/river');
    await router.push('/spirit/today');
    expect(router.currentRoute.value.path).toBe('/spirit/earthquakes');
  });

  it('rerolls random shortcuts from existing detail pages', async () => {
    const router = createSpiritsRouter(createMemoryHistory());
    await router.push('/adversary/england/4');
    await router.push('/adversary/random');
    const adversaryParams = router.currentRoute.value.params;
    expect(getAllAdversaries().some((item) => item.slug === adversaryParams.slug)).toBe(true);
    const level = Number(adversaryParams.level);
    expect(level).toBeGreaterThanOrEqual(ADVERSARY_MIN_LEVEL);
    expect(level).toBeLessThanOrEqual(ADVERSARY_MAX_LEVEL);

    await router.push('/spirit/river');
    await router.push('/spirit/random');
    expect(
      getAllSpirits().some((item) => item.slug === router.currentRoute.value.params.slug)
    ).toBe(true);
  });

  it('shows the selected level and reference on a shared adversary link', async () => {
    const router = createSpiritsRouter(createMemoryHistory());
    await router.push('/adversary/england/4');
    const wrapper = mount(AdversaryDetail, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.get('h1').text()).toBe('The Kingdom of England');
    expect(wrapper.get('#adversary-level').element).toHaveProperty('value', '4');
    await wrapper.findAll('.detail-tab')[1].trigger('click');
    expect(wrapper.get('section[aria-label="Gameplay reference"]').text()).toContain('Setup');
    await wrapper.get('#adversary-level').setValue('5');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/adversary/england/5');
  });
});
