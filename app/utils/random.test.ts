import { describe, it, expect, vi, afterEach } from 'vitest';
import { getTodaySeed } from './random';

describe('getTodaySeed', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a string', () => {
    expect(typeof getTodaySeed()).toBe('string');
  });

  it('returns the same value on repeated calls within the same day', () => {
    expect(getTodaySeed()).toBe(getTodaySeed());
  });

  it('returns a non-empty string', () => {
    expect(getTodaySeed().length).toBeGreaterThan(0);
  });

  it('returns the en-US locale date string for a known date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    expect(getTodaySeed()).toBe('1/15/2024');
  });

  it('changes value between different dates', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));
    const june = getTodaySeed();

    vi.setSystemTime(new Date('2024-06-02T12:00:00Z'));
    const nextDay = getTodaySeed();

    expect(june).not.toBe(nextDay);
  });
});
