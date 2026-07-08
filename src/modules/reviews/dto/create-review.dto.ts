import { z } from 'zod';

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10).max(1000),
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().min(10).max(1000).optional(),
});

export type UpdateReviewDto = z.infer<typeof UpdateReviewSchema>;
