import { Test, TestingModule } from '@nestjs/testing';
import { ProfitabilityService } from './profitability.service';

describe('ProfitabilityService', () => {
  let service: ProfitabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfitabilityService],
    }).compile();
    service = module.get<ProfitabilityService>(ProfitabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate - Amazon FBA', () => {
    it('should calculate correct ROI for FBA', () => {
      const result = service.calculate({
        purchasePrice: 10,
        salePrice: 29.99,
        marketplace: 'AMAZON',
        fulfillmentMethod: 'FBA',
        weightLbs: 1,
        category: 'Electronics',
      });
      expect(result.referralFee).toBeGreaterThan(0);
      expect(result.fulfillmentFee).toBeGreaterThan(0);
      expect(result.roi).toBeDefined();
      expect(result.netProfit).toBeDefined();
    });

    it('should flag as not viable when ROI < 20%', () => {
      const result = service.calculate({
        purchasePrice: 25,
        salePrice: 27,
        marketplace: 'AMAZON',
        fulfillmentMethod: 'FBA',
        weightLbs: 1,
      });
      expect(result.isViable).toBe(false);
    });

    it('should flag as viable for high ROI product', () => {
      const result = service.calculate({
        purchasePrice: 5,
        salePrice: 29.99,
        marketplace: 'AMAZON',
        fulfillmentMethod: 'FBA',
        weightLbs: 0.5,
        category: 'Toys & Games',
      });
      expect(result.roi).toBeGreaterThan(50);
      expect(result.isViable).toBe(true);
    });

    it('should apply correct referral fee rate (15% for Electronics)', () => {
      const price = 100;
      const result = service.calculate({
        purchasePrice: 50,
        salePrice: price,
        marketplace: 'AMAZON',
        fulfillmentMethod: 'FBA',
        weightLbs: 1,
        category: 'Electronics',
      });
      // Electronics: 8% referral fee
      expect(result.referralFee).toBeCloseTo(price * 0.08, 1);
    });
  });

  describe('calculate - eBay', () => {
    it('should apply eBay final value fee (12.9% + $0.30)', () => {
      const price = 50;
      const result = service.calculate({
        purchasePrice: 20,
        salePrice: price,
        marketplace: 'EBAY',
        fulfillmentMethod: 'EBAY_STANDARD',
        weightLbs: 1,
      });
      const expectedFee = (price * 0.129) + 0.30;
      expect(result.referralFee).toBeCloseTo(expectedFee, 1);
    });
  });

  describe('calculate - Walmart', () => {
    it('should apply Walmart 15% referral fee', () => {
      const price = 40;
      const result = service.calculate({
        purchasePrice: 20,
        salePrice: price,
        marketplace: 'WALMART',
        fulfillmentMethod: 'WALMART_WFS',
        weightLbs: 1,
      });
      expect(result.referralFee).toBeCloseTo(price * 0.15, 1);
    });
  });

  describe('findBestMarketplace', () => {
    it('should return sorted results by net profit', () => {
      const results = service.findBestMarketplace(10, 1, 'Electronics', 35, 30, 28);
      expect(results.length).toBeGreaterThan(0);
      // First result should have highest profit
      for (let i = 1; i < results.length; i++) {
        expect(results[0].result.netProfit).toBeGreaterThanOrEqual(results[i].result.netProfit);
      }
    });
  });

  describe('calculateBatch', () => {
    it('should calculate multiple items', () => {
      const inputs = [
        { purchasePrice: 10, salePrice: 25, marketplace: 'AMAZON' as any, fulfillmentMethod: 'FBA' as any, weightLbs: 1 },
        { purchasePrice: 5, salePrice: 15, marketplace: 'EBAY' as any, fulfillmentMethod: 'EBAY_STANDARD' as any, weightLbs: 0.5 },
      ];
      const results = service.calculateBatch(inputs);
      expect(results).toHaveLength(2);
      results.forEach(r => {
        expect(r.roi).toBeDefined();
        expect(r.netProfit).toBeDefined();
      });
    });
  });
});
