import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.productsService.findAll({ search, category, brand, page: +page, limit: +limit });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('brands')
  @ApiOperation({ summary: 'Get all product brands' })
  getBrands() {
    return this.productsService.getBrands();
  }

  @Get('upc/:upc')
  @ApiOperation({ summary: 'Find product by UPC' })
  findByUpc(@Param('upc') upc: string) {
    return this.productsService.findByUpc(upc);
  }

  @Get('asin/:asin')
  @ApiOperation({ summary: 'Find product by ASIN' })
  findByAsin(@Param('asin') asin: string) {
    return this.productsService.findByAsin(asin);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }
}
