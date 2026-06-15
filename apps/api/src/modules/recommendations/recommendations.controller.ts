import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecommendationsService, RecommendationInput } from './recommendations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class RecommendationsController {
  constructor(private readonly recService: RecommendationsService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Generate AI recommendation for an arbitrage opportunity' })
  analyze(@Body() input: RecommendationInput) {
    return this.recService.generateRecommendation(input);
  }
}
