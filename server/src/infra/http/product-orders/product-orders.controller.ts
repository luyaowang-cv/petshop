import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductOrderBody } from './dtos/create-product-order-body';
import { UpdateProductOrderStatusBody } from './dtos/update-product-order-status-body';
import { ListProductOrdersQuery } from './dtos/list-product-orders-query';
import { ProductSalesQuery } from './dtos/product-sales-query';
import { CreateProductOrderService } from 'src/app/use-cases/product-order/create-product-order-service';
import { ListProductOrdersService } from 'src/app/use-cases/product-order/list-product-orders-service';
import { ShowProductOrderService } from 'src/app/use-cases/product-order/show-product-order-service';
import { UpdateProductOrderStatusService } from 'src/app/use-cases/product-order/update-product-order-status-service';
import { GetProductSalesStatisticsService } from 'src/app/use-cases/product-order/get-product-sales-statistics-service';
import { ProductOrderViewModel } from '../view-models/product-order-view-model';

// 前端传的是 YYYY-MM-DD，按本地时区的当天 00:00 / 23:59:59 解析，
// 避免 new Date('YYYY-MM-DD') 按 UTC 解析导致漏掉当天订单。
function parseDateBoundary(value: string, endOfDay: boolean): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!dateOnly) {
    return new Date(value);
  }
  const [, year, month, day] = dateOnly;
  return endOfDay
    ? new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999)
    : new Date(Number(year), Number(month) - 1, Number(day));
}

@Controller('product-orders')
export class ProductOrdersController {
  constructor(
    private createProductOrderService: CreateProductOrderService,
    private listProductOrdersService: ListProductOrdersService,
    private showProductOrderService: ShowProductOrderService,
    private updateProductOrderStatusService: UpdateProductOrderStatusService,
    private getProductSalesStatisticsService: GetProductSalesStatisticsService,
  ) {}

  @Post()
  async create(@Body() body: CreateProductOrderBody) {
    const { order } = await this.createProductOrderService.execute({
      customerId: body.customerId,
      items: body.items,
      note: body.note,
      pointsUsed: body.pointsUsed,
      balanceUsed: body.balanceUsed,
    });

    return {
      order: ProductOrderViewModel.toHTTP(order),
    };
  }

  @Get()
  async list(@Query() query: ListProductOrdersQuery) {
    const filters: any = {};

    if (query.customerId) {
      filters.customerId = query.customerId;
    }

    if (query.status) {
      filters.status = query.status;
    }

    if (query.startDate) {
      filters.startDate = parseDateBoundary(query.startDate, false);
    }

    if (query.endDate) {
      filters.endDate = parseDateBoundary(query.endDate, true);
    }

    const pagination = {
      page: query.page,
      pageSize: query.pageSize,
    };

    const sort = query.sortOrder
      ? {
          sortBy: 'createdAt',
          sortOrder: query.sortOrder,
        }
      : undefined;

    const { orders, total } = await this.listProductOrdersService.execute({
      filters,
      pagination,
      sort,
    });

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    return {
      orders: orders.map((order) => ProductOrderViewModel.toHTTP(order)),
      meta: {
        total,
        page,
        pageSize,
      },
    };
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    const { order } = await this.showProductOrderService.execute({
      orderId: id,
    });

    return {
      order: ProductOrderViewModel.toHTTP(order),
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateProductOrderStatusBody,
  ) {
    const { order } = await this.updateProductOrderStatusService.execute({
      orderId: id,
      status: body.status,
    });

    return {
      order: ProductOrderViewModel.toHTTP(order),
    };
  }

  @Get('statistics/sales')
  async getSalesStatistics(@Query() query: ProductSalesQuery) {
    const startDate = query.startDate
      ? parseDateBoundary(query.startDate, false)
      : undefined;
    const endDate = query.endDate
      ? parseDateBoundary(query.endDate, true)
      : undefined;

    const statistics = await this.getProductSalesStatisticsService.execute({
      startDate,
      endDate,
      category: query.category,
    });

    return statistics;
  }
}
