import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReportsService } from './reports.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
  CreateReportSchema,
  type CreateReportDto,
} from './dto/create-report.dto.js';

@ApiTags('Bug Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit a bug report' })
  async create(
    @Body(new ZodValidationPipe(CreateReportSchema)) dto: CreateReportDto,
  ) {
    return this.reportsService.create(dto);
  }
}
