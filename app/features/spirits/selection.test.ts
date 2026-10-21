import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveSpiritShortcut } from './selection';

describe('spirit URLs', () => {
  afterEach(() => vi.useRealTimers());

  it('preserves the seeded today redirect', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 12));
    expect(resolveSpiritShortcut('today')).toBe('/spirit/earthquakes');
  });

  it('does not redirect regular spirits', () => {
    expect(resolveSpiritShortcut('river')).toBeNull();
  });
});
