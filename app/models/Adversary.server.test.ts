import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRandomAdversary, getAdversaryBySlug, getAllAdversaries } from './Adversary.server';

// Mock the Prisma client before any imports resolve it
vi.mock('~/utils/prisma', () => ({
  prisma: {
    adversary: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '~/utils/prisma';

// Convenience aliases with cast — vi.mock replaces these with vi.fn() instances
const mockCount = prisma.adversary.count as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.adversary.findMany as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.adversary.findUnique as ReturnType<typeof vi.fn>;

const mockAdversary = (overrides = {}) => ({
  id: '1',
  name: 'England',
  slug: 'england',
  expansion: 'Spirit Island',
  difficulty: 3,
  lossCondition: null,
  escalationAbility: {
    title: 'Tighten Control',
    description: 'Add 1 Town to each [[City]].',
  },
  levels: [
    { id: 'l0', adversaryId: '1', level: 0, difficulty: 0, title: 'No Adversary', fearCards: '3/3/3', description: '' },
    { id: 'l1', adversaryId: '1', level: 1, difficulty: 1, title: 'Level 1', fearCards: '3/3/3', description: 'Level 1 rules.' },
  ],
  references: [],
  ...overrides,
});

describe('Adversary model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRandomAdversary', () => {
    it('returns an adversary and a level', async () => {
      const adversary = mockAdversary();
      mockCount.mockResolvedValue(5);
      mockFindMany.mockResolvedValue([adversary]);

      const result = await getRandomAdversary('test-seed');

      expect(result.adversary).toEqual(adversary);
      expect(result.level).toBeGreaterThanOrEqual(0);
      expect(result.level).toBeLessThanOrEqual(6);
    });

    it('calls findMany with take: 1, a valid skip, and includes levels and references', async () => {
      mockCount.mockResolvedValue(8);
      mockFindMany.mockResolvedValue([mockAdversary()]);

      await getRandomAdversary('test-seed');

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
          include: { levels: true, references: true },
        })
      );
      const { skip } = mockFindMany.mock.calls[0][0];
      expect(skip).toBeGreaterThanOrEqual(0);
      expect(skip).toBeLessThan(8);
    });

    it('returns the same adversary and level for the same seed', async () => {
      const adversaries = [mockAdversary(), mockAdversary({ id: '2', slug: 'france' })];
      mockCount.mockResolvedValue(adversaries.length);
      mockFindMany.mockImplementation(({ skip }: { skip: number }) =>
        Promise.resolve([adversaries[skip % adversaries.length]])
      );

      const first = await getRandomAdversary('2024/01/15');

      vi.clearAllMocks();
      mockCount.mockResolvedValue(adversaries.length);
      mockFindMany.mockImplementation(({ skip }: { skip: number }) =>
        Promise.resolve([adversaries[skip % adversaries.length]])
      );

      const second = await getRandomAdversary('2024/01/15');

      expect(first.adversary).toEqual(second.adversary);
      expect(first.level).toBe(second.level);
    });

    it('uses different skip values for different seeds', async () => {
      mockCount.mockResolvedValue(100);
      mockFindMany.mockResolvedValue([mockAdversary()]);

      await getRandomAdversary('seed-a');
      const skipA = mockFindMany.mock.calls[0][0].skip;

      vi.clearAllMocks();
      mockCount.mockResolvedValue(100);
      mockFindMany.mockResolvedValue([mockAdversary()]);

      await getRandomAdversary('seed-b');
      const skipB = mockFindMany.mock.calls[0][0].skip;

      expect(skipA).not.toBe(skipB);
    });

    it('works with a null seed (unseeded random)', async () => {
      mockCount.mockResolvedValue(5);
      mockFindMany.mockResolvedValue([mockAdversary()]);

      const result = await getRandomAdversary(null);

      expect(result.adversary).toBeDefined();
    });

    it('returns a level between 0 and 6 (inclusive)', async () => {
      // Run several times to check the range holds across different seeds
      const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      for (const seed of seeds) {
        mockCount.mockResolvedValue(10);
        mockFindMany.mockResolvedValue([mockAdversary()]);

        const { level } = await getRandomAdversary(seed);
        expect(level).toBeGreaterThanOrEqual(0);
        expect(level).toBeLessThanOrEqual(6);

        vi.clearAllMocks();
      }
    });
  });

  describe('getAdversaryBySlug', () => {
    it('returns the adversary matching the given slug', async () => {
      const adversary = mockAdversary();
      mockFindUnique.mockResolvedValue(adversary);

      const result = await getAdversaryBySlug('england');

      expect(result).toEqual(adversary);
    });

    it('queries with the correct slug and includes levels and references', async () => {
      mockFindUnique.mockResolvedValue(mockAdversary());

      await getAdversaryBySlug('england');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { slug: 'england' },
        include: { levels: true, references: true },
      });
    });

    it('returns null when the slug does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getAdversaryBySlug('does-not-exist');

      expect(result).toBeNull();
    });
  });

  describe('getAllAdversaries', () => {
    it('returns all adversaries', async () => {
      const adversaries = [mockAdversary(), mockAdversary({ id: '2', slug: 'france' })];
      mockFindMany.mockResolvedValue(adversaries);

      const result = await getAllAdversaries();

      expect(result).toEqual(adversaries);
    });

    it('calls findMany exactly once and includes levels', async () => {
      mockFindMany.mockResolvedValue([]);

      await getAllAdversaries();

      expect(mockFindMany).toHaveBeenCalledOnce();
      expect(mockFindMany).toHaveBeenCalledWith({ include: { levels: true } });
    });
  });
});
