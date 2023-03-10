import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MongoIdPipe } from 'src/common/mongo-id/mongo-id.pipe';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/roles.models';

/* This is a pipe customized */
// import { ParseIntPipe } from 'src/common/parse-int/parse-int.pipe';

// Product Service import
import { ProductsService } from 'src/products/services/products.service';

// Products Dto import
import {
  CreateProductDto,
  FilterProductsDto,
  UpdateProductDto,
} from '../dtos/products.dto';

// JWT auth guard
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

// All endpoints protected by jwt - way 1
// @UseGuards(AuthGuard('jwt'))
// Way 2 (Only 1 validation) - @UseGuards(JwtAuthGuard)
// Multiple validation, de acuerdo al orden
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}
  /* Get Methods */
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Get()
  async getProducts(@Query() params: FilterProductsDto) {
    const rta = await this.productService.findAll(params);
    return {
      message: rta,
    };
  }

  @Get('/:productId')
  async getProduct(@Param('productId', MongoIdPipe) productId: string) {
    return {
      message: await this.productService.findOne(productId),
    };
  }

  // Metadata injection by decorator
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() payload: CreateProductDto) {
    const newProduct = await this.productService.create(payload);
    return {
      message: 'created',
      newProduct,
    };
  }

  @Patch('/:id')
  async update(
    @Param('id', MongoIdPipe) id: string,
    @Body() payload: UpdateProductDto,
  ) {
    const product = await this.productService.update(id, payload);
    return {
      message: 'updated',
      payload: {
        product,
      },
    };
  }

  /* Deleted Methods */
  @Delete('/:id')
  async delete(@Param('id', MongoIdPipe) id: string) {
    return await this.productService.remove(id);
  }
}
