import { z } from 'zod';

import CommonValidator from './common.validators';

// Location type enum
const locationTypeEnum = z.enum(['inside', 'outside', 'terrace']);

// Floor validators
const floorCreateSchema = z.object({
  name: z.string().trim().min(1, 'Floor name is required'),
  floorNumber: z.number().int().min(0, 'Floor number must be 0 or higher').max(99, 'Floor number cannot exceed 99'),
  locationType: locationTypeEnum,
  description: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

const floorUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Floor name is required').optional(),
  floorNumber: z
    .number()
    .int()
    .min(0, 'Floor number must be 0 or higher')
    .max(99, 'Floor number cannot exceed 99')
    .optional(),
  locationType: locationTypeEnum.optional(),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Row validators
const rowCreateSchema = z.object({
  name: z.string().trim().min(1, 'Row name is required'),
  rowNumber: z.number().int().min(1, 'Row number must be at least 1').max(99, 'Row number cannot exceed 99'),
  floor: CommonValidator.mongoIdValidation,
  description: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

const rowUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Row name is required').optional(),
  rowNumber: z.number().int().min(1, 'Row number must be at least 1').max(99, 'Row number cannot exceed 99').optional(),
  floor: CommonValidator.mongoIdValidation.optional(),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Table validators
const tableCreateSchema = z.object({
  name: z.string().trim().min(1, 'Table name is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(20, 'Capacity cannot exceed 20'),
  floor: CommonValidator.mongoIdValidation.optional(),
  row: CommonValidator.mongoIdValidation.optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

const tableUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Table name is required').optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(20, 'Capacity cannot exceed 20').optional(),
  floor: CommonValidator.mongoIdValidation.optional().nullable(),
  row: CommonValidator.mongoIdValidation.optional().nullable(),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Reservation validators
const reservationCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(6, 'Phone number is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
  guests: z.number().int().min(1, 'At least 1 guest required'),
  specialRequests: z.string().trim().max(500, 'Special requests cannot exceed 500 characters').optional(),
});

const reservationStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no-show']);

const reservationUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  phone: z.string().trim().min(6, 'Phone number is required').optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
  guests: z.number().int().min(1, 'At least 1 guest required').optional(),
  tableId: CommonValidator.mongoIdValidation.optional(),
  status: reservationStatusSchema.optional(),
  specialRequests: z.string().trim().max(500, 'Special requests cannot exceed 500 characters').optional().nullable(),
  adminNotes: z.string().trim().max(1000, 'Admin notes cannot exceed 1000 characters').optional().nullable(),
});

const reservationStatusUpdateSchema = z.object({
  status: reservationStatusSchema,
});

// Available slots query validator
const availableSlotsQuerySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  guests: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1, 'Guests must be at least 1'),
});

const ReservationValidator = {
  floorCreateSchema,
  floorUpdateSchema,
  rowCreateSchema,
  rowUpdateSchema,
  tableCreateSchema,
  tableUpdateSchema,
  reservationCreateSchema,
  reservationUpdateSchema,
  reservationStatusUpdateSchema,
  availableSlotsQuerySchema,
};

export default ReservationValidator;
