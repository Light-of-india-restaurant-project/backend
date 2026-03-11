import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

export interface IDiscount extends Document {
  type: 'delivery' | 'pickup';
  percentage: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    type: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
      unique: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true },
);

export const DiscountModel = model<IDiscount>('Discount', discountSchema);
