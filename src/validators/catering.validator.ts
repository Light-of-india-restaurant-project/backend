import { z } from 'zod';

import { CATERING_CATEGORY, DELIVERY_STATUS } from '../models/catering/catering.model';

// Delivery address schema
const deliveryAddressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(200),
  houseNumber: z.string().min(1, 'House number is required').max(20),
  city: z.string().min(1, 'City is required').max(100),
  postalCode: z.string().min(4, 'Postal code is required').max(10),
  additionalInfo: z.string().max(500).optional(),
});

// ============ CATERING PACK VALIDATORS ============

const createPackSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be at most 1000 characters'),
  descriptionNl: z
    .string()
    .min(1, 'Dutch description is required')
    .max(1000, 'Dutch description must be at most 1000 characters'),
  category: z.enum(CATERING_CATEGORY, {
    errorMap: () => ({ message: 'Category must be vegetarian, non-vegetarian, or mixed' }),
  }),
  pricePerPerson: z
    .number()
    .min(0.01, 'Price per person must be greater than 0')
    .max(10000, 'Price per person seems too high'),
  minPeople: z
    .number()
    .int('Minimum people must be a whole number')
    .min(1, 'Minimum people must be at least 1')
    .max(1000, 'Minimum people seems too high'),
  menuItems: z
    .array(z.string().min(1))
    .min(1, 'At least one menu item is required'),
  image: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

const updatePackSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(1000).optional(),
  descriptionNl: z.string().min(1).max(1000).optional(),
  category: z.enum(CATERING_CATEGORY).optional(),
  pricePerPerson: z.number().min(0.01).max(10000).optional(),
  minPeople: z.number().int().min(1).max(1000).optional(),
  menuItems: z.array(z.string().min(1)).min(1).optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// ============ CATERING ORDER VALIDATORS ============

const createOrderSchema = z.object({
  cateringPackId: z.string().min(1, 'Catering pack ID is required'),
  peopleCount: z
    .number()
    .int('People count must be a whole number')
    .min(1, 'People count must be at least 1'),
  deliveryDate: z
    .string()
    .min(1, 'Delivery date is required')
    .refine((date) => {
      const deliveryDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return deliveryDate >= today;
    }, 'Delivery date cannot be in the past'),
  deliveryTime: z
    .string()
    .min(1, 'Delivery time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  deliveryAddress: deliveryAddressSchema,
  customerName: z
    .string()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name must be at most 100 characters'),
  customerEmail: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be at most 255 characters'),
  customerPhone: z
    .string()
    .min(8, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format'),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
});

const updateDeliveryStatusSchema = z.object({
  deliveryStatus: z.enum(DELIVERY_STATUS, {
    errorMap: () => ({ message: 'Status must be yet_to_be_delivered or delivered' }),
  }),
});

// Query params schema
const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  category: z.enum(CATERING_CATEGORY).optional(),
  isActive: z.coerce.boolean().optional(),
  deliveryStatus: z.enum(DELIVERY_STATUS).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'expired', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const CateringValidator = {
  createPackSchema,
  updatePackSchema,
  createOrderSchema,
  updateDeliveryStatusSchema,
  queryParamsSchema,
};

export default CateringValidator;
