import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { AddWishlistDto } from './dto/wishlist.dto.js';
import { createSupabaseAdminClient } from '../../config/supabase.config.js';

@Injectable()
export class WishlistService {
  private supabase = createSupabaseAdminClient();

  async findByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('wishlists')
      .select('*, products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async addItem(userId: string, dto: AddWishlistDto) {
    const { data: existing } = await this.supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', dto.product_id)
      .maybeSingle();

    if (existing) return { message: 'Product already in wishlist' };

    const { data, error } = await this.supabase
      .from('wishlists')
      .insert({ user_id: userId, product_id: dto.product_id })
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async removeItem(userId: string, productId: string) {
    const { error } = await this.supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Removed from wishlist' };
  }

  async checkItem(userId: string, productId: string) {
    const { data, error } = await this.supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) throw new InternalServerErrorException(error.message);
    return { isInWishlist: !!data };
  }
}
