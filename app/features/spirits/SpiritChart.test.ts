import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { getSpiritBySlug } from '~/models/Spirit';
import SpiritChart from './SpiritChart.vue';

describe('spirit attributes', () => {
  it('shows all five named scores as accessible meters', () => {
    const spirit = getSpiritBySlug('river');
    expect(spirit).not.toBeNull();
    const wrapper = mount(SpiritChart, { props: { spirit: spirit! } });
    const meters = wrapper.findAll('[role="meter"]');
    expect(meters.map((meter) => meter.attributes('aria-label'))).toEqual([
      'Offense',
      'Control',
      'Fear',
      'Defense',
      'Utility',
    ]);
    expect(meters[0].attributes('aria-valuenow')).toBe(String(spirit!.offense));
  });
});
