import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import type {
  CreateReviewDto,
  UpdateReviewDto,
} from './dto/create-review.dto.js';
import { createSupabaseAdminClient } from '../../config/supabase.config.js';

@Injectable()
export class ReviewsService {
  private supabase = createSupabaseAdminClient();

  async findByProduct(productId: string) {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*, profiles(name, avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    const { data: existing } = await this.supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing)
      throw new ForbiddenException('You have already reviewed this product');

    const { data, error } = await this.supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating: dto.rating,
        text: dto.text,
      })
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    await this.updateProductRating(productId);
    return data;
  }

  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const { data: review } = await this.supabase
      .from('reviews')
      .select('user_id, product_id')
      .eq('id', reviewId)
      .single();

    if (!review) throw new NotFoundException('Review not found');
    if (review.user_id !== userId)
      throw new ForbiddenException('You can only edit your own reviews');

    const { data, error } = await this.supabase
      .from('reviews')
      .update(dto)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    await this.updateProductRating(review.product_id);
    return data;
  }

  async remove(reviewId: string, userId: string) {
    const { data: review } = await this.supabase
      .from('reviews')
      .select('user_id, product_id')
      .eq('id', reviewId)
      .single();

    if (!review) throw new NotFoundException('Review not found');
    if (review.user_id !== userId)
      throw new ForbiddenException('You can only delete your own reviews');

    const { error } = await this.supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    if (error) throw new InternalServerErrorException(error.message);
    await this.updateProductRating(review.product_id);
    return { message: 'Review deleted successfully' };
  }

  private async updateProductRating(productId: string) {
    const { data: stats } = await this.supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (!stats || stats.length === 0) {
      await this.supabase
        .from('products')
        .update({ rating: 0, review_count: 0 })
        .eq('id', productId);
      return;
    }

    const avgRating =
      stats.reduce((sum, r) => sum + r.rating, 0) / stats.length;
    await this.supabase
      .from('products')
      .update({
        rating: Math.round(avgRating * 10) / 10,
        review_count: stats.length,
      })
      .eq('id', productId);
  }
}
