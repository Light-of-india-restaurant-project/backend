import { z } from 'zod';

const createDeliveryZoneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  postalCodeStart: z
    .number()
    .int('Must be a whole number')
    .min(1000, 'Postal code must be between 1000 and 9999')
    .max(9999, 'Postal code must be between 1000 and 9999'),
  postalCodeEnd: z
    .number()
    .int('Must be a whole number')
    .min(1000, 'Postal code must be between 1000 and 9999')
    .max(9999, 'Postal code must be between 1000 and 9999'),
  isActive: z.boolean().optional().default(true),
  description: z.string().max(500, 'Description too long').optional(),
});

const updateDeliveryZoneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  postalCodeStart: z
    .number()
    .int('Must be a whole number')
    .min(1000, 'Postal code must be between 1000 and 9999')
    .max(9999, 'Postal code must be between 1000 and 9999')
    .optional(),
  postalCodeEnd: z
    .number()
    .int('Must be a whole number')
    .min(1000, 'Postal code must be between 1000 and 9999')
    .max(9999, 'Postal code must be between 1000 and 9999')
    .optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

const DeliveryZoneValidator = {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
};

export default DeliveryZoneValidator;
