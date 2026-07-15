import { z } from 'zod';

const ShippingAddressSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    zipCode: z.string().min(1).optional(),
  })
  .optional();

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  shipping_address: ShippingAddressSchema,
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
