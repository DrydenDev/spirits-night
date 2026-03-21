import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { toSpiritIslandText } from './spiritIslandText';

// Wrap the output (an array of mixed strings and React elements) in a container div
function Rendered({ text }: { text: string }) {
  return <div>{toSpiritIslandText(text)}</div>;
}

describe('toSpiritIslandText', () => {
  describe('plain text', () => {
    it('renders plain text unchanged', () => {
      const { container } = render(<Rendered text="Hello world" />);
      expect(container.textContent).toBe('Hello world');
    });

    it('produces no icon spans for plain text', () => {
      const { container } = render(<Rendered text="Just plain text" />);
      expect(container.querySelectorAll('.spirit-island-text')).toHaveLength(0);
    });
  });

  describe('spirit island tokens', () => {
    it('replaces [[Fear]] with the correct icon character', () => {
      const { container } = render(<Rendered text="[[Fear]]" />);
      const spans = container.querySelectorAll('.spirit-island-text');
      expect(spans).toHaveLength(1);
      expect(spans[0].textContent).toBe('F');
    });

    it('replaces [[Dahan]] with the correct icon character', () => {
      const { container } = render(<Rendered text="[[Dahan]]" />);
      const spans = container.querySelectorAll('.spirit-island-text');
      expect(spans[0].textContent).toBe('N');
    });

    it('replaces [[Blight]] with the correct icon character', () => {
      const { container } = render(<Rendered text="[[Blight]]" />);
      const spans = container.querySelectorAll('.spirit-island-text');
      expect(spans[0].textContent).toBe('B');
    });

    it('replaces multiple tokens in a single string', () => {
      const { container } = render(<Rendered text="[[Fear]] and [[Dahan]]" />);
      const spans = container.querySelectorAll('.spirit-island-text');
      expect(spans).toHaveLength(2);
      expect(spans[0].textContent).toBe('F');
      expect(spans[1].textContent).toBe('N');
    });

    it('preserves surrounding text when replacing a token', () => {
      const { container } = render(<Rendered text="Push 1 [[Dahan]]." />);
      expect(container.textContent).toBe('Push 1 N.');
    });

    it('replaces all known tokens', () => {
      const tokens: Record<string, string> = {
        '[[Beast]]': 'A',
        '[[Blight]]': 'B',
        '[[City]]': 'C',
        '[[Disease]]': 'D',
        '[[Explorer]]': 'E',
        '[[Fear]]': 'F',
        '[[Badlands]]': 'L',
        '[[Dahan]]': 'N',
        '[[Strife]]': 'S',
        '[[Town]]': 'T',
        '[[Wilds]]': 'W',
        '[[Presence]]': '1',
        '[[Sacred Site]]': '2',
        '[[Player]]': '.',
        '[[Players]]': ':',
        '[[Fast]]': '+',
        '[[Slow]]': '-',
      };

      for (const [token, expectedChar] of Object.entries(tokens)) {
        const { container } = render(<Rendered text={token} />);
        const span = container.querySelector('.spirit-island-text');
        expect(span, `Expected icon span for ${token}`).not.toBeNull();
        expect(span?.textContent, `Wrong character for ${token}`).toBe(expectedChar);
      }
    });
  });

  describe('markdown formatting', () => {
    it('wraps *text* in <strong>', () => {
      const { container } = render(<Rendered text="*bold text*" />);
      const strong = container.querySelector('strong');
      expect(strong).not.toBeNull();
      expect(strong?.textContent).toBe('bold text');
    });

    it('wraps _text_ in <em>', () => {
      const { container } = render(<Rendered text="_italic text_" />);
      const em = container.querySelector('em');
      expect(em).not.toBeNull();
      expect(em?.textContent).toBe('italic text');
    });
  });
});
