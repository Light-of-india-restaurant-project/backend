import { z } from 'zod';

// Days of the week
const dayOfWeekEnum = z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);

// Time format validation (HH:mm)
const timeFormat = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format');

// Operating hours for a single day
const operatingHoursSchema = z.object({
  day: dayOfWeekEnum,
  isOpen: z.boolean(),
  openTime: timeFormat,
  closeTime: timeFormat,
});

// Full settings update schema
const settingsUpdateSchema = z.object({
  operatingHours: z.array(operatingHoursSchema).length(7, 'Operating hours must include all 7 days').optional(),
  reservationDuration: z.number().int().min(30, 'Minimum duration is 30 minutes').max(240, 'Maximum duration is 4 hours').optional(),
  slotInterval: z.enum([15, 30, 60] as unknown as [string, ...string[]]).transform(Number).optional(),
  maxAdvanceDays: z.number().int().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days').optional(),
  maxGuestsPerReservation: z.number().int().min(1, 'Minimum 1 guest').max(50, 'Maximum 50 guests').optional(),
  minGuestsPerReservation: z.number().int().min(1, 'Minimum 1 guest').max(10, 'Maximum 10 guests').optional(),
});

// Operating hours update only
const operatingHoursUpdateSchema = z.object({
  operatingHours: z.array(operatingHoursSchema).length(7, 'Operating hours must include all 7 days'),
});

// Reservation settings update only
const reservationSettingsUpdateSchema = z.object({
  reservationDuration: z.number().int().min(30, 'Minimum duration is 30 minutes').max(240, 'Maximum duration is 4 hours').optional(),
  slotInterval: z.number().refine((val) => [15, 30, 60].includes(val), 'Slot interval must be 15, 30, or 60 minutes').optional(),
  maxAdvanceDays: z.number().int().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days').optional(),
  maxGuestsPerReservation: z.number().int().min(1, 'Minimum 1 guest').max(50, 'Maximum 50 guests').optional(),
  minGuestsPerReservation: z.number().int().min(1, 'Minimum 1 guest').max(10, 'Maximum 10 guests').optional(),
});

// Closed dates update only
const closedDatesUpdateSchema = z.object({
  closedDates: z.array(z.string().or(z.date())).default([]),
});

// Order settings update (delivery/pickup enabled)
const orderSettingsUpdateSchema = z.object({
  deliveryEnabled: z.boolean().optional(),
  pickupEnabled: z.boolean().optional(),
});

const RestaurantSettingsValidator = {
  settingsUpdateSchema,
  operatingHoursUpdateSchema,
  reservationSettingsUpdateSchema,
  closedDatesUpdateSchema,
  orderSettingsUpdateSchema,
  operatingHoursSchema,
  dayOfWeekEnum,
};

export default RestaurantSettingsValidator;
