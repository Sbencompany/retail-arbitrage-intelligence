import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });

  readonly httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });

  readonly opportunitiesDiscovered = new Counter({
    name: 'rai_opportunities_discovered_total',
    help: 'Total opportunities discovered',
    labelNames: ['marketplace', 'store'],
    registers: [this.registry],
  });

  readonly dealsScanned = new Counter({
    name: 'rai_deals_scanned_total',
    help: 'Total deals scanned per store',
    labelNames: ['store'],
    registers: [this.registry],
  });

  readonly activeOpportunities = new Gauge({
    name: 'rai_active_opportunities',
    help: 'Current active opportunities count',
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
