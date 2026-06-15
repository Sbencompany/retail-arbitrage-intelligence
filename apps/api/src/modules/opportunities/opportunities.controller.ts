import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OpportunitiesService, OpportunityFilter } from './opportunities.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('opportunities')
@Controller('opportunities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class OpportunitiesController {
  constructor(private readonly oppService: OpportunitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all opportunities with filters' })
  findAll(
    @Query('status') status?: string,
    @Query('marketplace') marketplace?: string,
    @Query('minRoi') minRoi?: number,
    @Query('minProfit') minProfit?: number,
    @Query('minScore') minScore?: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.oppService.findAll({ status, marketplace, minRoi, minProfit, minScore, page: +page, limit: +limit, sortBy, sortOrder });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get opportunities dashboard stats' })
  getStats() {
    return this.oppService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity details' })
  findOne(@Param('id') id: string) {
    return this.oppService.findOne(id);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze and create a new opportunity' })
  analyze(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.oppService.analyzeAndCreateOpportunity({ ...body, userId });
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss an opportunity' })
  dismiss(@Param('id') id: string) {
    return this.oppService.dismiss(id);
  }

  @Patch(':id/purchase')
  @ApiOperation({ summary: 'Mark opportunity as purchased' })
  markPurchased(@Param('id') id: string) {
    return this.oppService.markPurchased(id);
  }
}
