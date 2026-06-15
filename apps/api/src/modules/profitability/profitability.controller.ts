import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfitabilityService, ProfitabilityInput } from './profitability.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('profitability')
@Controller('profitability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ProfitabilityController {
  constructor(private readonly profitabilityService: ProfitabilityService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate profitability for a single item' })
  calculate(@Body() input: ProfitabilityInput) {
    return this.profitabilityService.calculate(input);
  }

  @Post('calculate/batch')
  @ApiOperation({ summary: 'Calculate profitability for multiple items' })
  calculateBatch(@Body() inputs: ProfitabilityInput[]) {
    return this.profitabilityService.calculateBatch(inputs);
  }

  @Post('compare-marketplaces')
  @ApiOperation({ summary: 'Find best marketplace to sell on' })
  compareMarketplaces(@Body() body: {
    purchasePrice: number;
    weightLbs: number;
    category: string;
    amazonPrice: number;
    walmartPrice: number;
    ebayPrice: number;
  }) {
    return this.profitabilityService.findBestMarketplace(
      body.purchasePrice, body.weightLbs, body.category,
      body.amazonPrice, body.walmartPrice, body.ebayPrice,
    );
  }
}
