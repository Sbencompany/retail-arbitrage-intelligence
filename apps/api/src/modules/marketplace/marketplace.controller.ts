import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('marketplace')
@Controller('marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get marketplace API configuration status' })
  getStatus() {
    return this.marketplaceService.getMarketplaceStatus();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search all marketplaces' })
  search(@Query('q') query: string) {
    return this.marketplaceService.searchAllMarketplaces(query);
  }

  @Get('upc/:upc')
  @ApiOperation({ summary: 'Search by UPC across marketplaces' })
  searchByUpc(@Param('upc') upc: string) {
    return this.marketplaceService.searchByUpc(upc);
  }

  @Get('amazon/:asin')
  @ApiOperation({ summary: 'Get Amazon listing by ASIN' })
  getAmazonListing(@Param('asin') asin: string) {
    return this.marketplaceService.getAmazonListingByAsin(asin);
  }
}
