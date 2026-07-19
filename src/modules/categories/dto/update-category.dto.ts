import { z } from 'zod';

export const UpdateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional().catch(undefined),
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
