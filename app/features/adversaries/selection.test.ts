import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseAdversaryLevel, resolveAdversaryShortcut } from './selection';

describe('adversary URLs', () => {
  afterEach(() => vi.useRealTimers());

  it('keeps missing levels optional and clamps explicit levels', () => {
    expect(parseAdversaryLevel(undefined)).toBeNull();
    expect(parseAdversaryLevel('-2')).toBe(0);
    expect(parseAdversaryLevel('20')).toBe(6);
    expect(parseAdversaryLevel('4abc')).toBe(4);
  });

  it('preserves the seeded today redirect', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 12));
    expect(resolveAdversaryShortcut('today')).toBe('/adversary/bradenburg-prussia/3');
  });

  it('keeps the daily minimum unless a level was explicitly requested', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 5, 12));
    expect(resolveAdversaryShortcut('today')).toMatch(/\/3$/);
    expect(resolveAdversaryShortcut('today', '1')).toMatch(/\/1$/);
  });

  it('does not redirect regular adversaries', () => {
    expect(resolveAdversaryShortcut('england')).toBeNull();
  });
});
