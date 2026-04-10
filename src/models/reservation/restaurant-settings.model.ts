import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Day of week enum
export const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Operating Hours Interface
export interface IOperatingHours {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
}

// Restaurant Settings Interface
export interface IRestaurantSettings extends Document {
  operatingHours: IOperatingHours[];
  closedDates: Date[]; // Specific dates that are closed (holidays, etc.)
  reservationDuration: number; // Duration in minutes (60, 90, 120, etc.)
  slotInterval: number; // Time slot interval in minutes (15, 30, 60)
  maxAdvanceDays: number; // How many days ahead can reservations be made
  maxGuestsPerReservation: number;
  minGuestsPerReservation: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  pickupStartTime: string;
  pickupEndTime: string;
  pickupInterval: number;
  minimumOrderAmount: number;
  deliveryCharge: number;
  createdAt: Date;
  updatedAt: Date;
}

// Operating Hours Schema
const operatingHoursSchema = new Schema<IOperatingHours>(
  {
    day: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      default: '09:00',
    },
    closeTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      default: '22:00',
    },
  },
  { _id: false },
);

// Restaurant Settings Schema
const restaurantSettingsSchema = new Schema<IRestaurantSettings>(
  {
    operatingHours: {
      type: [operatingHoursSchema],
      required: true,
      default: DAYS_OF_WEEK.map((day) => ({
        day,
        isOpen: day !== 'sunday', // Closed on Sunday by default
        openTime: '09:00',
        closeTime: '22:00',
      })),
      validate: {
        validator: (hours: IOperatingHours[]) => hours.length === 7,
        message: 'Operating hours must include all 7 days of the week',
      },
    },
    closedDates: {
      type: [Date],
      default: [],
    },
    reservationDuration: {
      type: Number,
      required: true,
      default: 90, // 1.5 hours default
      min: 30,
      max: 240, // Max 4 hours
    },
    slotInterval: {
      type: Number,
      required: true,
      default: 30,
      enum: [15, 30, 60], // 15 min, 30 min, or 1 hour slots
    },
    maxAdvanceDays: {
      type: Number,
      required: true,
      default: 30, // Can book up to 30 days ahead
      min: 1,
      max: 365,
    },
    maxGuestsPerReservation: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
      max: 50,
    },
    minGuestsPerReservation: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 10,
    },
    deliveryEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    pickupEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    pickupStartTime: {
      type: String,
      required: true,
      default: '16:00',
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    pickupEndTime: {
      type: String,
      required: true,
      default: '21:30',
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    pickupInterval: {
      type: Number,
      required: true,
      default: 30,
      enum: [15, 30, 60],
    },
    minimumOrderAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

// Ensure only one settings document exists (singleton pattern)
restaurantSettingsSchema.index({}, { unique: true });

export const RestaurantSettingsModel = model<IRestaurantSettings>('RestaurantSettings', restaurantSettingsSchema);
