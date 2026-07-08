import { z } from 'zod';

const ShippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
});

export const CreateOrderSchema = z.object({
  shipping_address: ShippingAddressSchema,
  payment_method: z.string().min(1),
  notes: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
