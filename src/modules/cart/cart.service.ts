import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto.js';
import { createSupabaseAdminClient } from '../../config/supabase.config.js';

@Injectable()
export class CartService {
  private supabase = createSupabaseAdminClient();

  async findByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select(
        'id, user_id, product_id, quantity, selected_size, selected_color, created_at, products(id, name, slug, price, images, category, stock, original_price)',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error)
      throw new InternalServerErrorException('An internal error occurred');
    return data || [];
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const { data: product } = await this.supabase
      .from('products')
      .select('stock')
      .eq('id', dto.product_id)
      .single();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock === 'out-of-stock') {
      throw new BadRequestException('Product is out of stock');
    }

    const { data: existing } = await this.supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', dto.product_id)
      .eq('selected_size', dto.selected_size || null)
      .eq('selected_color', dto.selected_color || null)
      .maybeSingle();

    if (existing) {
      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + dto.quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error)
        throw new InternalServerErrorException('An internal error occurred');
      return data;
    }

    const { data, error } = await this.supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: dto.product_id,
        quantity: dto.quantity,
        selected_size: dto.selected_size || null,
        selected_color: dto.selected_color || null,
      })
      .select()
      .single();

    if (error)
      throw new InternalServerErrorException('An internal error occurred');
    return data;
  }

  async updateItem(itemId: string, userId: string, dto: UpdateCartItemDto) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .update({
        quantity: dto.quantity,
        selected_size: dto.selected_size || null,
        selected_color: dto.selected_color || null,
      })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new NotFoundException('Cart item not found');
    return data;
  }

  async removeItem(itemId: string, userId: string) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw new NotFoundException('Cart item not found');
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error)
      throw new InternalServerErrorException('An internal error occurred');
    return { message: 'Cart cleared successfully' };
  }

  async getCartSummary(userId: string) {
    const items = await this.findByUser(userId);

    const subtotal = items.reduce(
      (sum, item) => sum + ((item.products as any)?.price || 0) * item.quantity,
      0,
    );
    const shippingCost = subtotal >= 50 ? 0 : 5;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping_cost: shippingCost,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}
