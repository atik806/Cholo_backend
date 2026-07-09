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

const CheckoutItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_image: z.string().nullable().optional(),
  price: z.number(),
  quantity: z.number().int().positive(),
  selected_size: z.string().nullable().optional(),
  selected_color: z.string().nullable().optional(),
});

export const CheckoutOrderSchema = z.object({
  shipping_address: ShippingAddressSchema,
  payment_method: z.string().min(1),
  items: z.array(CheckoutItemSchema).min(1, 'Cart is empty'),
  notes: z.string().optional(),
});

export type CheckoutOrderDto = z.infer<typeof CheckoutOrderSchema>;
