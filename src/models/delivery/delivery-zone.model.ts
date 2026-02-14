import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Delivery Zone Interface
export interface IDeliveryZone extends Document {
  name: string;
  postalCodeStart: number;
  postalCodeEnd: number;
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
    postalCodeStart: {
      type: Number,
      required: true,
      min: 1000,
      max: 9999,
    },
    postalCodeEnd: {
      type: Number,
      required: true,
      min: 1000,
      max: 9999,
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

// Ensure postalCodeEnd >= postalCodeStart
deliveryZoneSchema.pre('save', function validateRange(next) {
  if (this.postalCodeEnd < this.postalCodeStart) {
    const error = new Error('Postal code end must be greater than or equal to postal code start');
    return next(error);
  }
  next();
});

// Index for efficient queries
deliveryZoneSchema.index({ postalCodeStart: 1, postalCodeEnd: 1 });
deliveryZoneSchema.index({ isActive: 1 });

export const DeliveryZoneModel = model<IDeliveryZone>('DeliveryZone', deliveryZoneSchema);
