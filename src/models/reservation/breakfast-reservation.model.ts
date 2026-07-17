import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

export const BREAKFAST_RESERVATION_STATUS = ['pending', 'accepted', 'rejected', 'cancelled'] as const;
export type BreakfastReservationStatus = (typeof BREAKFAST_RESERVATION_STATUS)[number];

export interface IBreakfastReservation extends Document {
  name: string;
  email: string;
  contactNumber: string;
  numberOfGuests: number;
  reservationDate: Date;
  status: BreakfastReservationStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const breakfastReservationSchema = new Schema<IBreakfastReservation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 20,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    reservationDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: BREAKFAST_RESERVATION_STATUS,
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

breakfastReservationSchema.index({ reservationDate: 1 });
breakfastReservationSchema.index({ status: 1 });
breakfastReservationSchema.index({ email: 1 });
breakfastReservationSchema.index({ createdAt: -1 });

export const BreakfastReservationModel = model<IBreakfastReservation>('BreakfastReservation', breakfastReservationSchema);

export default BreakfastReservationModel;
