import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DemandService } from './demand.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('demand')
@Controller('demand')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  @Post('estimate-from-bsr')
  @ApiOperation({ summary: 'Estimate monthly sales from Amazon BSR' })
  estimateFromBsr(@Body() body: { bsr: number; category: string }) {
    const sales = this.demandService.estimateSalesFromBsr(body.bsr, body.category);
    return { bsr: body.bsr, category: body.category, estimatedMonthlySales: sales };
  }

  @Post('score')
  @ApiOperation({ summary: 'Calculate demand score' })
  calculateScore(@Body() params: {
    bsr?: number; estimatedMonthlySales?: number;
    reviewCount?: number; rating?: number;
    totalSellers?: number; soldLast30Days?: number;
  }) {
    const score = this.demandService.calculateDemandScore(params);
    return { demandScore: score };
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get latest demand data for a product' })
  getDemandData(@Param('productId') productId: string) {
    return this.demandService.getLatestDemandData(productId);
  }
}
