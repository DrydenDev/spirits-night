import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory } from 'vue-router';
import App from '~/App.vue';
import { createSpiritsRouter } from '~/router';
import { PLAY_STORAGE_KEY, parsePlayArchive, serializePlayArchive } from './storage';
import type { Play } from './types';

describe('game night play log', () => {
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
    vi.stubGlobal('crypto', { randomUUID: () => 'new-game-id' });
    vi.stubGlobal('scrollTo', vi.fn());
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function openLog(path = '/plays') {
    const router = createSpiritsRouter(createMemoryHistory());
    await router.push(path);
    const wrapper = mount(App, { global: { plugins: [router] } });
    await flushPromises();
    return { wrapper, router };
  }

  it('records, edits, and deletes a play in browser storage', async () => {
    const { wrapper } = await openLog();
    expect(wrapper.text()).toContain('No games yet');
    await wrapper.get('#play-date').setValue('2026-10-21');
    await wrapper.get('#play-adversary').setValue('england');
    await wrapper.get('#play-level').setValue('4');
    await wrapper.get('#play-spirit-0').setValue('river');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    const saved = parsePlayArchive(window.localStorage.getItem(PLAY_STORAGE_KEY) ?? '');
    expect(saved).toMatchObject({
      ok: true,
      value: [{ adversarySlug: 'england', level: 4, spiritSlugs: ['river'] }],
    });
    expect(wrapper.text()).toContain('Game saved in this browser');
    expect(wrapper.text()).toContain('1 win in 1 recorded game');

    await wrapper.get('button[aria-label="Edit game from 2026-10-21"]').trigger('click');
    await wrapper.get('#play-result').setValue('loss');
    await wrapper.get('#play-feel').setValue('hard');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(parsePlayArchive(window.localStorage.getItem(PLAY_STORAGE_KEY) ?? '')).toMatchObject({
      ok: true,
      value: [{ result: 'loss', feltDifficulty: 'hard' }],
    });

    await wrapper.get('button[aria-label="Delete game from 2026-10-21"]').trigger('click');
    expect(wrapper.text()).toContain('Confirm delete');
    await wrapper.get('button[aria-label="Confirm delete game from 2026-10-21"]').trigger('click');
    await flushPromises();
    expect(parsePlayArchive(window.localStorage.getItem(PLAY_STORAGE_KEY) ?? '')).toEqual({
      ok: true,
      value: [],
    });
  });

  it('prefills the adversary and level from a reference link', async () => {
    const { wrapper } = await openLog('/plays?adversary=england&level=4&spirit=river');
    expect((wrapper.get('#play-adversary').element as HTMLSelectElement).value).toBe('england');
    expect((wrapper.get('#play-level').element as HTMLSelectElement).value).toBe('4');
    expect((wrapper.get('#play-spirit-0').element as HTMLSelectElement).value).toBe('river');
  });

  it('prefills a valid picker lineup', async () => {
    const { wrapper } = await openLog('/plays?spirits=river,earthquakes');
    expect((wrapper.get('#play-spirit-0').element as HTMLSelectElement).value).toBe('river');
    expect((wrapper.get('#play-spirit-1').element as HTMLSelectElement).value).toBe('earthquakes');
    expect((wrapper.get('#play-players').element as HTMLInputElement).value).toBe('2');
  });

  it('rejects duplicate Spirits in a picker lineup', async () => {
    const fresh = await openLog('/plays?spirits=river,river');
    expect((fresh.wrapper.get('#play-spirit-0').element as HTMLSelectElement).value).toBe('');
    expect(fresh.wrapper.find('#play-spirit-1').exists()).toBe(false);
  });

  it('shows a storage failure without adding an unsaved game to the list', async () => {
    const { wrapper } = await openLog();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    await wrapper.get('#play-adversary').setValue('england');
    await wrapper.get('#play-spirit-0').setValue('river');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain('could not be saved');
    expect(wrapper.text()).toContain('No games yet');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'play_log_write_failed' })
    );
  });

  it('imports valid games and rejects an invalid file without changing the log', async () => {
    const { wrapper } = await openLog();
    const importedPlay: Play = {
      id: 'imported-game',
      date: '2026-10-20',
      adversarySlug: 'england',
      level: 4,
      spiritSlugs: ['river'],
      playerCount: 1,
      result: 'win',
      feltDifficulty: 'right',
    };
    const fileInput = wrapper.get('input[type="file"]');
    Object.defineProperty(fileInput.element, 'files', {
      configurable: true,
      value: [{ text: async () => serializePlayArchive([importedPlay]) }],
    });
    await fileInput.trigger('change');
    await flushPromises();
    expect(wrapper.text()).toContain('1 game imported');
    expect(wrapper.text()).toContain('1 saved in this browser');

    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    Object.defineProperty(fileInput.element, 'files', {
      configurable: true,
      value: [{ text: async () => '{broken' }],
    });
    await fileInput.trigger('change');
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain('not valid JSON');
    expect(parsePlayArchive(window.localStorage.getItem(PLAY_STORAGE_KEY) ?? '')).toEqual({
      ok: true,
      value: [importedPlay],
    });
    expect(warningSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'play_log_import_rejected' })
    );
  });
});
