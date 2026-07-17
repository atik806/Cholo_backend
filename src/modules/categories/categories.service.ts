import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';
import { createSupabaseAdminClient } from '../../config/supabase.config.js';

@Injectable()
export class CategoriesService {
  private supabase = createSupabaseAdminClient();

  async findAll() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error)
      throw new InternalServerErrorException('An internal error occurred');

    const categories = data || [];

    const { data: products } = await this.supabase
      .from('products')
      .select('category_id');

    const countMap = new Map<string, number>();
    for (const p of products || []) {
      countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
    }

    return categories.map((c) => ({
      ...c,
      product_count: countMap.get(c.id) || 0,
    }));
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) throw new NotFoundException('Category not found');
    return data;
  }

  async create(dto: CreateCategoryDto) {
    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const { data, error } = await this.supabase
      .from('categories')
      .insert({ ...dto, slug, product_count: 0 })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('A category with this slug already exists');
      }
      throw new InternalServerErrorException('An internal error occurred');
    }
    return data;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const { data, error } = await this.supabase
      .from('categories')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('A category with this slug already exists');
      }
      throw new NotFoundException('Category not found');
    }
    if (!data) throw new NotFoundException('Category not found');
    return data;
  }

  async remove(id: string) {
    const { data: products } = await this.supabase
      .from('products')
      .select('id')
      .eq('category_id', id);

    const actualCount = products?.length || 0;

    if (actualCount > 0) {
      throw new ConflictException(
        `Cannot delete category: it still has ${actualCount} product(s) assigned to it. Please delete or reassign all products first.`,
      );
    }

    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException('Category not found');
    return { message: 'Category deleted successfully' };
  }
}
