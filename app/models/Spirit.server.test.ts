import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRandomSpirit, getSpiritBySlug, getAllSpirits } from './Spirit.server';

// Mock the Prisma client before any imports resolve it
vi.mock('~/utils/prisma', () => ({
  prisma: {
    spirit: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '~/utils/prisma';

// Convenience aliases with cast — vi.mock replaces these with vi.fn() instances
const mockCount = prisma.spirit.count as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.spirit.findMany as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.spirit.findUnique as ReturnType<typeof vi.fn>;

const mockSpirit = (overrides = {}) => ({
  id: '1',
  name: "Lightning's Swift Strike",
  slug: 'lightning',
  expansion: 'Spirit Island',
  complexity: 'Moderate',
  complexityValue: 1,
  incarna: false,
  offense: 4,
  control: 2,
  fear: 2,
  defense: 1,
  utility: 1,
  playstyle: null,
  ...overrides,
});

describe('Spirit model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRandomSpirit', () => {
    it('returns a spirit', async () => {
      const spirit = mockSpirit();
      mockCount.mockResolvedValue(10);
      mockFindMany.mockResolvedValue([spirit]);

      const result = await getRandomSpirit('test-seed');

      expect(result).toEqual(spirit);
    });

    it('calls findMany with take: 1 and a skip derived from the count', async () => {
      mockCount.mockResolvedValue(10);
      mockFindMany.mockResolvedValue([mockSpirit()]);

      await getRandomSpirit('test-seed');

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 })
      );
      const { skip } = mockFindMany.mock.calls[0][0];
      expect(skip).toBeGreaterThanOrEqual(0);
      expect(skip).toBeLessThan(10);
    });

    it('returns the same spirit for the same seed', async () => {
      const spirits = [mockSpirit({ slug: 'lightning' }), mockSpirit({ id: '2', slug: 'river' })];
      mockCount.mockResolvedValue(spirits.length);
      mockFindMany.mockImplementation(({ skip }: { skip: number }) =>
        Promise.resolve([spirits[skip % spirits.length]])
      );

      const first = await getRandomSpirit('2024/01/15');

      vi.clearAllMocks();
      mockCount.mockResolvedValue(spirits.length);
      mockFindMany.mockImplementation(({ skip }: { skip: number }) =>
        Promise.resolve([spirits[skip % spirits.length]])
      );

      const second = await getRandomSpirit('2024/01/15');

      expect(first).toEqual(second);
    });

    it('uses different skip values for different seeds', async () => {
      mockCount.mockResolvedValue(100);
      mockFindMany.mockResolvedValue([mockSpirit()]);

      await getRandomSpirit('seed-a');
      const skipA = mockFindMany.mock.calls[0][0].skip;

      vi.clearAllMocks();
      mockCount.mockResolvedValue(100);
      mockFindMany.mockResolvedValue([mockSpirit()]);

      await getRandomSpirit('seed-b');
      const skipB = mockFindMany.mock.calls[0][0].skip;

      expect(skipA).not.toBe(skipB);
    });

    it('works with a null seed (unseeded random)', async () => {
      mockCount.mockResolvedValue(5);
      mockFindMany.mockResolvedValue([mockSpirit()]);

      const result = await getRandomSpirit(null);

      expect(result).toBeDefined();
    });
  });

  describe('getSpiritBySlug', () => {
    it('returns the spirit matching the given slug', async () => {
      const spirit = mockSpirit();
      mockFindUnique.mockResolvedValue(spirit);

      const result = await getSpiritBySlug('lightning');

      expect(result).toEqual(spirit);
    });

    it('queries by the correct slug field', async () => {
      mockFindUnique.mockResolvedValue(mockSpirit());

      await getSpiritBySlug('lightning');

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { slug: 'lightning' } });
    });

    it('returns null when the slug does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getSpiritBySlug('does-not-exist');

      expect(result).toBeNull();
    });
  });

  describe('getAllSpirits', () => {
    it('returns all spirits', async () => {
      const spirits = [mockSpirit(), mockSpirit({ id: '2', slug: 'river' })];
      mockFindMany.mockResolvedValue(spirits);

      const result = await getAllSpirits();

      expect(result).toEqual(spirits);
    });

    it('calls findMany exactly once with no filters', async () => {
      mockFindMany.mockResolvedValue([]);

      await getAllSpirits();

      expect(mockFindMany).toHaveBeenCalledOnce();
    });
  });
});
