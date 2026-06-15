import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard KPIs and analytics' })
  getDashboard() {
    return this.analyticsService.getDashboardKpis();
  }

  @Get('top-opportunities')
  @ApiOperation({ summary: 'Get top scoring opportunities' })
  getTopOpportunities(@Query('limit') limit = 10) {
    return this.analyticsService.getTopOpportunities(+limit);
  }
}
