import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  CreateOrderSchema,
  type CreateOrderDto,
} from './dto/create-order.dto.js';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user order history' })
  async findAll(@CurrentUser() user: JwtUser) {
    return this.ordersService.findByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  async findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.ordersService.findById(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(CreateOrderSchema)) dto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending order' })
  async cancel(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.ordersService.cancelOrder(id, user.id);
  }
}
