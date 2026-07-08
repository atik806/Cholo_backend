import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
