import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Offer Interface
export interface IOffer extends Document {
  name: string;
  description: string;
  descriptionNl: string;
  price: number;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Offer Schema
const offerSchema = new Schema<IOffer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionNl: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
    },
    validUntil: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const OfferModel = model<IOffer>('Offer', offerSchema);
