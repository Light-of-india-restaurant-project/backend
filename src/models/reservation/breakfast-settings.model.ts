import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';
import type { DayOfWeek, IOperatingHours, IRestaurantClosedDate } from './restaurant-settings.model';

// Breakfast Settings Interface
export interface IBreakfastSettings extends Document {
  operatingHours: IOperatingHours[];
  closedDates: Date[];
  openDates: Date[];
  restaurantClosedDates: IRestaurantClosedDate[];
  reservationDuration: number;
  slotInterval: number;
  maxAdvanceDays: number;
  maxGuestsPerReservation: number;
  minGuestsPerReservation: number;
  createdAt: Date;
  updatedAt: Date;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

const restaurantClosedDateSchema = new Schema<IRestaurantClosedDate>(
  {
    date: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: false },
);

const breakfastSettingsSchema = new Schema<IBreakfastSettings>(
  {
    operatingHours: {
      type: [operatingHoursSchema],
      required: true,
      default: DAYS_OF_WEEK.map((day) => ({
        day,
        isOpen: day !== 'sunday',
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
    openDates: {
      type: [Date],
      default: [],
    },
    restaurantClosedDates: {
      type: [restaurantClosedDateSchema],
      default: [],
    },
    reservationDuration: {
      type: Number,
      required: true,
      default: 90,
      min: 30,
      max: 240,
    },
    slotInterval: {
      type: Number,
      required: true,
      default: 30,
      enum: [15, 30, 60],
    },
    maxAdvanceDays: {
      type: Number,
      required: true,
      default: 30,
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
  },
  { timestamps: true },
);

breakfastSettingsSchema.index({}, { unique: true });

export const BreakfastSettingsModel = model<IBreakfastSettings>('BreakfastSettings', breakfastSettingsSchema);
