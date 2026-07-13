import { z } from 'zod';

export const CreateReportSchema = z.object({
  message: z.string().min(1, 'Description is required').max(2000),
  screenshot_url: z.string().url('Invalid screenshot URL').optional().nullable(),
  page_url: z.string().min(1, 'Page URL is required').max(500),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export type CreateReportDto = z.infer<typeof CreateReportSchema>;
