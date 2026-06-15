import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find nearby stores using Haversine formula
   */
  async findNearbyStores(lat: number, lon: number, radiusMiles = 25) {
    // PostgreSQL doesn't have built-in geo distance without PostGIS
    // Using application-level Haversine calculation
    const locations = await this.prisma.storeLocation.findMany({
      where: { isActive: true },
      include: { store: true },
    });

    const nearby = locations
      .map(loc => ({
        ...loc,
        distanceMiles: this.haversineDistance(lat, lon, loc.latitude, loc.longitude),
      }))
      .filter(loc => loc.distanceMiles <= radiusMiles)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);

    return nearby;
  }

  async findNearbyDeals(lat: number, lon: number, radiusMiles = 25, minDiscount = 30) {
    const nearbyStores = await this.findNearbyStores(lat, lon, radiusMiles);
    const storeIds = nearbyStores.map(s => s.storeId);

    if (storeIds.length === 0) return [];

    const deals = await this.prisma.retailListing.findMany({
      where: {
        storeId: { in: storeIds },
        isOnSale: true,
        discount: { gte: minDiscount },
        inStock: true,
      },
      include: {
        product: true,
        store: true,
      },
      orderBy: { discount: 'desc' },
      take: 50,
    });

    return deals.map(deal => ({
      ...deal,
      storeDistance: nearbyStores.find(s => s.storeId === deal.storeId)?.distanceMiles ?? 0,
    }));
  }

  /**
   * Haversine distance formula
   * Returns distance in miles
   */
  haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Earth radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async getZipCodeCoordinates(zipCode: string): Promise<{ lat: number; lon: number } | null> {
    // In production, integrate with USPS Zip Code API or similar
    // For now, returning approximate center-of-US for unknown zips
    const knownZips: Record<string, { lat: number; lon: number }> = {
      '10001': { lat: 40.7484, lon: -73.9967 },
      '90210': { lat: 34.0901, lon: -118.4065 },
      '60601': { lat: 41.8858, lon: -87.6181 },
      '77001': { lat: 29.7604, lon: -95.3698 },
      '30301': { lat: 33.7490, lon: -84.3880 },
    };
    return knownZips[zipCode] ?? null;
  }
}
