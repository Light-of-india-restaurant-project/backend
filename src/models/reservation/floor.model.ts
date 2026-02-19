import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Location type enum
export const LOCATION_TYPES = ['inside', 'outside', 'terrace'] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

// Floor Interface
export interface IFloor extends Document {
  name: string;
  floorNumber: number;
  locationType: LocationType;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Floor Schema
const floorSchema = new Schema<IFloor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    floorNumber: {
      type: Number,
      required: true,
      min: 0,
      max: 99,
    },
    locationType: {
      type: String,
      enum: LOCATION_TYPES,
      required: true,
      default: 'inside',
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Indexes - compound unique on floorNumber + locationType allows same floor number with different locations
floorSchema.index({ floorNumber: 1, locationType: 1 }, { unique: true });
floorSchema.index({ isActive: 1 });
floorSchema.index({ locationType: 1 });

export const FloorModel = model<IFloor>('Floor', floorSchema);
