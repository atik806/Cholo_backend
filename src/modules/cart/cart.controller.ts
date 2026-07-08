import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  AddCartItemSchema,
  UpdateCartItemSchema,
  type AddCartItemDto,
  type UpdateCartItemDto,
} from './dto/cart-item.dto.js';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart items' })
  async getCart(@CurrentUser() user: JwtUser) {
    return this.cartService.findByUser(user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get cart summary with totals' })
  async getSummary(@CurrentUser() user: JwtUser) {
    return this.cartService.getCartSummary(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(AddCartItemSchema)) dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Update cart item quantity or variant' })
  async updateItem(
    @CurrentUser() user: JwtUser,
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(UpdateCartItemSchema)) dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(itemId, user.id, dto);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @CurrentUser() user: JwtUser,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(itemId, user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@CurrentUser() user: JwtUser) {
    return this.cartService.clearCart(user.id);
  }
}
