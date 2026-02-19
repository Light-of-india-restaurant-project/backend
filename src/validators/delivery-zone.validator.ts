import { z } from 'zod';

const createDeliveryZoneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  postalCode: z
    .string()
    .regex(/^[0-9]{4}$/, 'Postal code must be 4 digits'),
  isActive: z.boolean().optional().default(true),
  description: z.string().max(500, 'Description too long').optional(),
});

const updateDeliveryZoneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  postalCode: z
    .string()
    .regex(/^[0-9]{4}$/, 'Postal code must be 4 digits')
    .optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

const DeliveryZoneValidator = {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
};

export default DeliveryZoneValidator;
