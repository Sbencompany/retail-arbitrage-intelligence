import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FreightService, ShippingRequest } from './freight.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('freight')
@Controller('freight')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class FreightController {
  constructor(private readonly freightService: FreightService) {}

  @Post('quotes')
  @ApiOperation({ summary: 'Get shipping quotes from USPS, UPS, and FedEx' })
  getQuotes(@Body() req: ShippingRequest) {
    return this.freightService.getQuotes(req);
  }

  @Post('cheapest')
  @ApiOperation({ summary: 'Get cheapest shipping option' })
  getCheapest(@Body() req: ShippingRequest) {
    return this.freightService.getCheapestQuote(req);
  }

  @Post('dimensional-weight')
  @ApiOperation({ summary: 'Calculate dimensional weight' })
  getDimWeight(@Body() body: { lengthIn: number; widthIn: number; heightIn: number; actualLbs: number }) {
    const dimWeight = this.freightService.calculateDimWeight(body.lengthIn, body.widthIn, body.heightIn);
    const billable = this.freightService.calculateBillableWeight(body.actualLbs, body.lengthIn, body.widthIn, body.heightIn);
    return { dimensionalWeight: dimWeight, billableWeight: billable, actualWeight: body.actualLbs };
  }
}
