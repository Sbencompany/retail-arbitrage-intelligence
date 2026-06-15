import { Test, TestingModule } from '@nestjs/testing';
import { DemandService } from './demand.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  demandData: { create: jest.fn(), findFirst: jest.fn() },
};

describe('DemandService', () => {
  let service: DemandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemandService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DemandService>(DemandService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('estimateSalesFromBsr', () => {
    it('should return high sales for BSR <= 100', () => {
      expect(service.estimateSalesFromBsr(50, 'Electronics')).toBeGreaterThanOrEqual(1000);
    });
    it('should return moderate sales for BSR ~10000', () => {
      const sales = service.estimateSalesFromBsr(10000, 'default');
      expect(sales).toBeGreaterThan(0);
      expect(sales).toBeLessThan(500);
    });
    it('should return low sales for high BSR', () => {
      expect(service.estimateSalesFromBsr(500000, 'default')).toBeLessThan(50);
    });
    it('should apply category multiplier for Books', () => {
      const booksales = service.estimateSalesFromBsr(1000, 'Books');
      const defaultSales = service.estimateSalesFromBsr(1000, 'default');
      expect(booksales).toBeGreaterThan(defaultSales);
    });
  });

  describe('calculateDemandScore', () => {
    it('should return score > 50 for good signals', () => {
      const score = service.calculateDemandScore({ bsr: 5000, estimatedMonthlySales: 100, reviewCount: 500, rating: 4.5, totalSellers: 5 });
      expect(score).toBeGreaterThan(50);
    });
    it('should cap score at 100', () => {
      const score = service.calculateDemandScore({ bsr: 100, estimatedMonthlySales: 1000, reviewCount: 10000, rating: 5.0, soldLast30Days: 500 });
      expect(score).toBeLessThanOrEqual(100);
    });
    it('should return score >= 0 even for bad signals', () => {
      const score = service.calculateDemandScore({ bsr: 999999, estimatedMonthlySales: 1, totalSellers: 100 });
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('assessCompetition', () => {
    it('should return VERY_LOW for 0 sellers', () => {
      expect(service.assessCompetition(0, 0)).toBe('VERY_LOW');
    });
    it('should return LOW for 1-2 sellers', () => {
      expect(service.assessCompetition(2, 1)).toBe('LOW');
    });
    it('should return VERY_HIGH for 25+ sellers', () => {
      expect(service.assessCompetition(30, 20)).toBe('VERY_HIGH');
    });
  });

  describe('calculateSellThroughRate', () => {
    it('should calculate correct rate', () => {
      expect(service.calculateSellThroughRate(50, 100)).toBe(50);
    });
    it('should return 0 for zero listings', () => {
      expect(service.calculateSellThroughRate(10, 0)).toBe(0);
    });
  });

  describe('calculateRecommendedQuantity', () => {
    it('should not exceed budget', () => {
      const qty = service.calculateRecommendedQuantity(100, 200, 25);
      expect(qty * 25).toBeLessThanOrEqual(200);
    });
    it('should return 1 for zero monthly sales', () => {
      expect(service.calculateRecommendedQuantity(0, 1000, 20)).toBe(1);
    });
  });
});
