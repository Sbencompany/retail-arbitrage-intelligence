import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DealDiscoveryService } from './deal-discovery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('deals')
@Controller('deals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class DealDiscoveryController {
  constructor(private readonly dealService: DealDiscoveryService) {}

  @Post('scan')
  @Roles('ADMIN', 'ANALYST')
  @ApiOperation({ summary: 'Trigger full store scan (admin/analyst only)' })
  triggerScan() {
    return this.dealService.startFullScan().then(() => ({ message: 'Scan queued successfully' }));
  }

  @Post('scan/:storeSlug')
  @Roles('ADMIN', 'ANALYST')
  @ApiOperation({ summary: 'Scan specific store' })
  scanStore(@Param('storeSlug') storeSlug: string) {
    return this.dealService.scanStore(storeSlug);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get scan queue status' })
  getStatus() {
    return this.dealService.getScanStatus();
  }
}
