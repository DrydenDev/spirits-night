import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory } from 'vue-router';
import { createSpiritsRouter } from '~/router';
import App from '~/App.vue';

describe('community adversary pages', () => {
  afterEach(() => vi.unstubAllGlobals());

  async function openPage(path: string) {
    vi.stubGlobal('scrollTo', vi.fn());
    const router = createSpiritsRouter(createMemoryHistory());
    await router.push(path);
    const wrapper = mount(App, { global: { plugins: [router] } });
    await flushPromises();
    return wrapper;
  }

  it('opens a complete community card with its original source', async () => {
    const wrapper = await openPage('/adversary/nestene-invasion/4');
    expect(wrapper.text()).toContain('Nestene Consciousness');
    expect(wrapper.text()).toContain('Persistence of Plastic');
    expect(wrapper.text()).not.toContain('Alien Factories');
    expect(
      wrapper.get('a[href="https://www.fecundity.com/codex/si-adversaries.pdf"]').text()
    ).toContain('Original rules');
    expect(
      wrapper
        .get(
          'a[href="https://boardgamegeek.com/thread/2956689/custom-adversary-the-nestene-invasion"]'
        )
        .text()
    ).toContain('Discussion and play notes');
  });

  it('offers Monaco level 7 and community links on the index', async () => {
    const detail = await openPage('/adversary/principality-of-monaco/7');
    expect(detail.get('#adversary-level').attributes('max')).toBe('7');
    expect(detail.text()).toContain('Surge of Interest');

    const index = await openPage('/adversary');
    expect(index.get('a[href="/adversary/principality-of-monaco"]').text()).toContain('View rules');
    expect(index.get('a[href="/adversary/nestene-invasion"]').text()).toContain('View rules');
    expect(
      index.findAll('a[href="https://www.fecundity.com/codex/si-adversaries.pdf"]')
    ).toHaveLength(2);
    expect(index.get('a[href="/adversary/dutch-east-india-company"]').text()).toContain(
      'View rules'
    );
    expect(index.get('a[href="/adversary/papal-states"]').text()).toContain('View rules');
    expect(index.get('a[href="/adversary/denmark-norway"]').text()).toContain('View rules');
    expect(index.get('a[href="/adversary/horde-of-zombies"]').text()).toContain('View rules');
    expect(index.get('a[href="/adversary/ottoman-empire"]').text()).toContain('View rules');
    expect(index.get('a[href="/adversary/byzantine-empire"]').text()).toContain('View rules');
    expect(index.get('a[href="/adversary/dutch-republic"]').text()).toContain('View rules');
    expect(index.get('a[href="/adversary/mongol-empire"]').text()).toContain('View rules');
    expect(index.get('a[href="https://boardgamegeek.com/image/7173410"]').text()).toContain(
      'Original rules'
    );
    expect(index.text()).toContain('Limited play reports');
  });

  it('shows the Papal States source and balance note alongside its level rules', async () => {
    const detail = await openPage('/adversary/papal-states/6');
    expect(detail.text()).toContain('Bastion of Faith');
    expect(detail.text()).toContain('easier than expected');
    expect(detail.get('[aria-label="Community playtest assessment"]').text()).toContain('Balance:');
    expect(detail.get('a[href="https://boardgamegeek.com/image/7173410"]').text()).toContain(
      'Original rules'
    );
  });

  it('shows zombie play notes without changing the printed level two rule', async () => {
    const detail = await openPage('/adversary/horde-of-zombies/2');
    expect(detail.text()).toContain('Shambling Zombies');
    expect(detail.text()).toContain('After a land Ravages');
    expect(detail.get('[aria-label="Community playtest assessment"]').text()).toContain(
      'optional house adjustment'
    );
    expect(detail.get('a[href="https://i.redd.it/ha0gcxaf9wya1.png"]').text()).toContain(
      'Original rules'
    );
  });

  it('shows Byzantine rules, source, and timing note in the detail page', async () => {
    const detail = await openPage('/adversary/byzantine-empire/3');
    expect(detail.text()).toContain('Indestructible Citadels');
    expect(detail.text()).toContain('No creator clarification was found');
    expect(detail.get('a[href="https://boardgamegeek.com/image/7173384"]').text()).toContain(
      'Original rules'
    );
  });

  it('links Dutch text rules and shows its custom Event', async () => {
    const detail = await openPage('/adversary/dutch-republic/2');
    expect(detail.text()).toContain('Coastal Swamps Are Ground for New Diseases');
    expect(detail.text()).toContain('Plague Epidemic');
    expect(
      detail
        .get(
          'a[href="https://www.reddit.com/r/spiritisland/comments/wur0sx/custom_adversary_the_dutch_republic/"]'
        )
        .text()
    ).toContain('Original rules');
  });

  it('shows Mongol Warlords and links the original card', async () => {
    const detail = await openPage('/adversary/mongol-empire/6');
    expect(detail.text()).toContain('Merciless Display of Power');
    expect(detail.text()).toContain('Warlords');
    expect(detail.text()).toContain('fear-focused matchups');
    expect(detail.get('a[href="https://i.redd.it/bc3c4ukq40k91.png"]').text()).toContain(
      'Original rules'
    );
  });
});
