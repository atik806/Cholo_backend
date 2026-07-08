import { z } from 'zod';

export const AddWishlistSchema = z.object({
  product_id: z.string().uuid(),
});

export type AddWishlistDto = z.infer<typeof AddWishlistSchema>;
