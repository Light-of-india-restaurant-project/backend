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

// ==================== Simple Reservation Validators ====================

// Valid time slots (16:00 to 21:45 in 15-minute intervals)
const VALID_TIME_SLOTS = [
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
  '18:00', '18:15', '18:30', '18:45',
  '19:00', '19:15', '19:30', '19:45',
  '20:00', '20:15', '20:30', '20:45',
  '21:00', '21:15', '21:30', '21:45',
] as const;

const simpleReservationCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  contactNumber: z
    .string()
    .trim()
    .min(8, 'Contact number must be at least 8 characters')
    .max(20, 'Contact number cannot exceed 20 characters'),
  numberOfGuests: z
    .number()
    .int()
    .min(1, 'At least 1 guest required')
    .max(50, 'Maximum 50 guests allowed'),
  reservationDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  reservationTime: z.string().refine((val) => VALID_TIME_SLOTS.includes(val as typeof VALID_TIME_SLOTS[number]), 'Invalid time slot'),
});

const simpleReservationRejectSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, 'Rejection reason is required')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
  adminNote: z.string().trim().max(1000, 'Admin note cannot exceed 1000 characters').optional(),
});

const simpleReservationCancelSchema = z.object({
  cancellationReason: z
    .string()
    .trim()
    .min(1, 'Cancellation reason is required')
    .max(500, 'Cancellation reason cannot exceed 500 characters'),
  adminNote: z.string().trim().max(1000, 'Admin note cannot exceed 1000 characters').optional(),
});

const simpleReservationAcceptSchema = z.object({
  adminNote: z.string().trim().max(1000, 'Admin note cannot exceed 1000 characters').optional(),
});

const simpleReservationEmailQuerySchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
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
  // Simple reservation validators
  simpleReservationCreateSchema,
  simpleReservationRejectSchema,
  simpleReservationCancelSchema,
  simpleReservationAcceptSchema,
  simpleReservationEmailQuerySchema,
};

export default ReservationValidator;
