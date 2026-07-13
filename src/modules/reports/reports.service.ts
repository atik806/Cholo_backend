import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createSupabaseAdminClient } from '../../config/supabase.config.js';
import type { CreateReportDto } from './dto/create-report.dto.js';

@Injectable()
export class ReportsService {
  private supabase = createSupabaseAdminClient();

  async create(dto: CreateReportDto, userId?: string) {
    const { error } = await this.supabase.from('bug_reports').insert({
      message: dto.message,
      screenshot_url: dto.screenshot_url || null,
      page_url: dto.page_url,
      priority: dto.priority || 'medium',
      user_id: userId || null,
    });

    if (error) {
      throw new InternalServerErrorException('Failed to submit report');
    }

    return { message: 'Report submitted successfully' };
  }
}
