import { z } from 'zod';

const dayOfWeekEnum = z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);

const timeFormat = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format');

const operatingHoursSchema = z.object({
  day: dayOfWeekEnum,
  isOpen: z.boolean(),
  openTime: timeFormat,
  closeTime: timeFormat,
});

const settingsUpdateSchema = z.object({
  operatingHours: z.array(operatingHoursSchema).length(7, 'Operating hours must include all 7 days').optional(),
  restaurantClosedDates: z.array(
    z.object({
      date: z.string().or(z.date()),
      reason: z.string().trim().min(1, 'Reason is required').max(300, 'Reason must be at most 300 characters'),
    }),
  ).optional(),
  reservationDuration: z.number().int().min(30, 'Minimum duration is 30 minutes').max(240, 'Maximum duration is 4 hours').optional(),
  slotInterval: z.enum([15, 30, 60] as unknown as [string, ...string[]]).transform(Number).optional(),
  maxAdvanceDays: z.number().int().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days').optional(),
  maxGuestsPerReservation: z.number().int().min(1, 'Minimum 1 guest').max(50, 'Maximum 50 guests').optional(),
  minGuestsPerReservation: z.number().int().min(1, 'Minimum 1 guest').max(10, 'Maximum 10 guests').optional(),
});

const operatingHoursUpdateSchema = z.object({
  operatingHours: z.array(operatingHoursSchema).length(7, 'Operating hours must include all 7 days'),
});

const reservationSettingsUpdateSchema = z.object({
  reservationDuration: z.number().int().min(30, 'Minimum duration is 30 minutes').max(240, 'Maximum duration is 4 hours').optional(),
  slotInterval: z.number().refine((val) => [15, 30, 60].includes(val), 'Slot interval must be 15, 30, or 60 minutes').optional(),
  maxAdvanceDays: z.number().int().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days').optional(),
  maxGuestsPerReservation: z.number().int().min(1, 'Minimum 1 guest').max(50, 'Maximum 50 guests').optional(),
  minGuestsPerReservation: z.number().int().min(1, 'Minimum 1 guest').max(10, 'Maximum 10 guests').optional(),
});

const closedDatesUpdateSchema = z.object({
  closedDates: z.array(z.string().or(z.date())).default([]),
  openDates: z.array(z.string().or(z.date())).optional(),
});

const restaurantClosedDatesUpdateSchema = z.object({
  restaurantClosedDates: z.array(
    z.object({
      date: z.string().or(z.date()),
      reason: z.string().trim().min(1, 'Reason is required').max(300, 'Reason must be at most 300 characters'),
    }),
  ).default([]),
});

const BreakfastSettingsValidator = {
  settingsUpdateSchema,
  operatingHoursUpdateSchema,
  reservationSettingsUpdateSchema,
  closedDatesUpdateSchema,
  restaurantClosedDatesUpdateSchema,
};

export default BreakfastSettingsValidator;
