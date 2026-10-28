import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CreateProductBody } from './dtos/create-product-body';
import { UpdateProductBody } from './dtos/update-product-body';
import { ProductListQueryDTO } from './dtos/product-list-query';
import { ProductViewModel } from '../view-models/product-view-model';
import { CreateProductService } from '@app/use-cases/product/create-product-service';
import { ListProductsService } from '@app/use-cases/product/list-products-service';
import { ShowProductService } from '@app/use-cases/product/show-product-service';
import { UpdateProductService } from '@app/use-cases/product/update-product-service';
import { DeleteProductService } from '@app/use-cases/product/delete-product-service';
import { ToggleProductStatusService } from '@app/use-cases/product/toggle-product-status-service';

@Controller('products')
export class ProductsController {
  constructor(
    private createProductService: CreateProductService,
    private listProductsService: ListProductsService,
    private showProductService: ShowProductService,
    private updateProductService: UpdateProductService,
    private deleteProductService: DeleteProductService,
    private toggleProductStatusService: ToggleProductStatusService,
  ) {}

  @Get()
  async list(@Query() query: ProductListQueryDTO) {
    const { products, total } = await this.listProductsService.execute(query);

    return {
      data: products.map(ProductViewModel.toHTTP),
      total,
      page: query.page || 1,
      pageSize: query.pageSize || 10,
    };
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    const { product } = await this.showProductService.execute(id);

    return { product: ProductViewModel.toHTTP(product) };
  }

  @Post()
  async create(@Body() body: CreateProductBody) {
    const { product } = await this.createProductService.execute(body);

    return { product: ProductViewModel.toHTTP(product) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProductBody) {
    const { product } = await this.updateProductService.execute({ id, body });

    return { product: ProductViewModel.toHTTP(product) };
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    const { product } = await this.toggleProductStatusService.execute(id);

    return { product: ProductViewModel.toHTTP(product) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteProductService.execute(id);

    return { message: '商品删除成功' };
  }
}
