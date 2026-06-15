import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DealDiscoveryService } from './deal-discovery.service';

@Processor('deal-discovery')
export class DealDiscoveryProcessor {
  private readonly logger = new Logger(DealDiscoveryProcessor.name);

  constructor(private readonly dealDiscovery: DealDiscoveryService) {}

  @Process('scan-store')
  async scanStore(job: Job<{ storeSlug: string; storeId: string }>) {
    const { storeSlug } = job.data;
    this.logger.log(`Processing scan for: ${storeSlug}`);
    await job.progress(10);
    const deals = await this.dealDiscovery.scanStore(storeSlug);
    await job.progress(100);
    return { storeSlug, dealsFound: deals.length };
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} (scan-store) failed: ${error.message}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed: ${JSON.stringify(result)}`);
  }
}
