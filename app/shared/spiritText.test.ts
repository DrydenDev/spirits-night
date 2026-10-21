import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import SpiritText from './SpiritText.vue';
import { parseSpiritText } from './spiritText';

describe('Spirit Island text', () => {
  it('keeps unknown tokens visible', () => {
    expect(parseSpiritText('Unknown [[Something]]')).toEqual([
      { kind: 'text', value: 'Unknown ' },
      { kind: 'text', value: '[[Something]]' },
    ]);
  });

  it('renders icons accessibly and formats emphasis', () => {
    const wrapper = mount(SpiritText, {
      props: { text: '*Fear* from [[Dahan]] is _helpful_.' },
    });
    expect(wrapper.get('strong').text()).toBe('Fear');
    expect(wrapper.get('em').text()).toBe('helpful');
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('Dahan');
    expect(wrapper.get('[role="img"]').text()).toBe('N');
    expect(wrapper.text()).toBe('Fear from N is helpful.');
  });

  it.each([
    ['Beast', 'A'],
    ['Blight', 'B'],
    ['City', 'C'],
    ['Disease', 'D'],
    ['Explorer', 'E'],
    ['Fear', 'F'],
    ['Badlands', 'L'],
    ['Dahan', 'N'],
    ['Strife', 'S'],
    ['Town', 'T'],
    ['Wilds', 'W'],
    ['Presence', '1'],
    ['Sacred Site', '2'],
    ['Player', '.'],
    ['Players', ':'],
    ['Fast', '+'],
    ['Slow', '-'],
  ])('preserves the %s glyph', (token, glyph) => {
    const wrapper = mount(SpiritText, { props: { text: `[[${token}]]` } });
    expect(wrapper.get('[role="img"]').text()).toBe(glyph);
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe(token);
  });
});
