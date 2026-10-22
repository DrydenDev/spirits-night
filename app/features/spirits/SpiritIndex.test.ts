import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory } from 'vue-router';
import App from '~/App.vue';
import { serializePlayArchive } from '~/features/plays/storage';
import { PLAY_STORAGE_KEY } from '~/features/plays/storage';
import type { Play } from '~/features/plays/types';
import { getAllSpirits, getSpiritBySlug } from '~/models/Spirit';
import { createSpiritsRouter } from '~/router';
import { SHORTLIST_SIZE } from './picker';

function play(id: string, date: string, spiritSlugs: string[]): Play {
  return {
    id,
    date,
    adversarySlug: 'england',
    level: 1,
    spiritSlugs,
    playerCount: spiritSlugs.length,
    result: 'win',
    feltDifficulty: 'right',
  };
}

async function openSpirits() {
  const router = createSpiritsRouter(createMemoryHistory());
  await router.push('/spirit');
  const wrapper = mount(App, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

describe('Spirit picker screen', () => {
  let storage: Storage;

  beforeEach(() => {
    const values = new Map<string, string>();
    storage = {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => [...values.keys()][index] ?? null,
      removeItem: (key) => {
        values.delete(key);
      },
      setItem: (key, value) => {
        values.set(key, value);
      },
    };
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('starts with every Spirit and builds a unique removable lineup', async () => {
    const wrapper = await openSpirits();
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(getAllSpirits().length);

    const river = getSpiritBySlug('river')!;
    const earthquakes = getSpiritBySlug('earthquakes')!;
    await wrapper.get(`button[aria-label="Pick ${river.name}"]`).trigger('click');
    await wrapper.get(`button[aria-label="Pick ${earthquakes.name}"]`).trigger('click');
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(getAllSpirits().length - 2);
    expect(wrapper.get('a[href*="/plays?spirits="]').attributes('href')).toContain(
      'river,earthquakes'
    );

    await wrapper.get(`button[aria-label="Remove ${river.name} from lineup"]`).trigger('click');
    expect(wrapper.find(`button[aria-label="Pick ${river.name}"]`).exists()).toBe(true);
    expect(wrapper.get('a[href*="/plays?spirits="]').attributes('href')).toContain('earthquakes');
  });

  it('combines play-history filters and deals from the filtered pool', async () => {
    storage.setItem(
      PLAY_STORAGE_KEY,
      serializePlayArchive([
        play('first', '2026-01-01', ['river']),
        play('second', '2026-01-02', ['river', 'earthquakes']),
      ])
    );
    const wrapper = await openSpirits();
    const river = getSpiritBySlug('river')!;
    const earthquakes = getSpiritBySlug('earthquakes')!;

    await wrapper.get('button[title="Spirits absent from this browser’s log"]').trigger('click');
    expect(wrapper.find(`button[aria-label="Pick ${river.name}"]`).exists()).toBe(false);
    expect(wrapper.find(`button[aria-label="Pick ${earthquakes.name}"]`).exists()).toBe(false);

    await wrapper.get('button[title="Spirits absent from this browser’s log"]').trigger('click');
    await wrapper.get('button[title="Played at least 2 times"]').trigger('click');
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(1);
    expect(wrapper.find(`button[aria-label="Pick ${river.name}"]`).exists()).toBe(true);

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Random shortlist')!
      .trigger('click');
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(1);
    await wrapper.get('button[title="Spirits absent from this browser’s log"]').trigger('click');
    expect(wrapper.text()).toContain('No Spirits match these filters.');
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Clear filters')!
      .trigger('click');
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(getAllSpirits().length);
  });

  it('deals a shortlist and reshuffles without changing the full Spirit list', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const wrapper = await openSpirits();
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Random shortlist')!
      .trigger('click');
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(SHORTLIST_SIZE);
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Reshuffle')!
      .trigger('click');
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(SHORTLIST_SIZE);
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Random shortlist')!
      .trigger('click');
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(getAllSpirits().length);
  });

  it('surfaces a play-history read failure and disables history filters', async () => {
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('read failed');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = await openSpirits();
    expect(wrapper.get('[role="alert"]').text()).toContain('Saved games could not be read');
    expect(
      wrapper.get('button[title="Spirits absent from this browser’s log"]').attributes('disabled')
    ).toBeDefined();
    expect(wrapper.findAll('button[aria-label^="Pick "]')).toHaveLength(getAllSpirits().length);
  });
});
