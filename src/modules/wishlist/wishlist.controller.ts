import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AddWishlistSchema, type AddWishlistDto } from './dto/wishlist.dto.js';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async findAll(@CurrentUser() user: JwtUser) {
    return this.wishlistService.findByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  async addItem(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(AddWishlistSchema)) dto: AddWishlistDto,
  ) {
    return this.wishlistService.addItem(user.id, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeItem(
    @CurrentUser() user: JwtUser,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeItem(user.id, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  async checkItem(
    @CurrentUser() user: JwtUser,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.checkItem(user.id, productId);
  }
}
