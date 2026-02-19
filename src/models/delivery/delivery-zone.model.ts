import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Delivery Zone Interface
export interface IDeliveryZone extends Document {
  name: string;
  postalCode: string; // Dutch postal code numeric part (4 digits, e.g., "3011")
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Delivery Zone Schema
const deliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{4}$/, 'Postal code must be 4 digits'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
deliveryZoneSchema.index({ postalCode: 1 }, { unique: true });
deliveryZoneSchema.index({ isActive: 1 });

export const DeliveryZoneModel = model<IDeliveryZone>('DeliveryZone', deliveryZoneSchema);
