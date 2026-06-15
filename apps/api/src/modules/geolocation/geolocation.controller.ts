import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GeolocationService } from './geolocation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('geolocation')
@Controller('geolocation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class GeolocationController {
  constructor(private readonly geoService: GeolocationService) {}

  @Get('nearby-stores')
  @ApiOperation({ summary: 'Find nearby retail stores' })
  getNearbyStores(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius = 25,
  ) {
    return this.geoService.findNearbyStores(+lat, +lon, +radius);
  }

  @Get('nearby-deals')
  @ApiOperation({ summary: 'Find deals at nearby stores' })
  getNearbyDeals(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius = 25,
    @Query('minDiscount') minDiscount = 30,
  ) {
    return this.geoService.findNearbyDeals(+lat, +lon, +radius, +minDiscount);
  }
}
