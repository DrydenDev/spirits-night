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
      const tokens: Record<string, { char: string; label: string }> = {
        '[[Beast]]':       { char: 'A', label: 'Beast' },
        '[[Blight]]':      { char: 'B', label: 'Blight' },
        '[[City]]':        { char: 'C', label: 'City' },
        '[[Disease]]':     { char: 'D', label: 'Disease' },
        '[[Explorer]]':    { char: 'E', label: 'Explorer' },
        '[[Fear]]':        { char: 'F', label: 'Fear' },
        '[[Badlands]]':    { char: 'L', label: 'Badlands' },
        '[[Dahan]]':       { char: 'N', label: 'Dahan' },
        '[[Strife]]':      { char: 'S', label: 'Strife' },
        '[[Town]]':        { char: 'T', label: 'Town' },
        '[[Wilds]]':       { char: 'W', label: 'Wilds' },
        '[[Presence]]':    { char: '1', label: 'Presence' },
        '[[Sacred Site]]': { char: '2', label: 'Sacred Site' },
        '[[Player]]':      { char: '.', label: 'Player' },
        '[[Players]]':     { char: ':', label: 'Players' },
        '[[Fast]]':        { char: '+', label: 'Fast' },
        '[[Slow]]':        { char: '-', label: 'Slow' },
      };

      for (const [token, { char, label }] of Object.entries(tokens)) {
        const { container } = render(<Rendered text={token} />);
        const span = container.querySelector('.spirit-island-text');
        expect(span, `Expected icon span for ${token}`).not.toBeNull();
        expect(span?.textContent, `Wrong character for ${token}`).toBe(char);
        expect(span?.getAttribute('aria-label'), `Wrong aria-label for ${token}`).toBe(label);
        expect(span?.getAttribute('role')).toBe('img');
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
