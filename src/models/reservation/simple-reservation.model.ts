import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Reservation Status
export const SIMPLE_RESERVATION_STATUS = ['pending', 'accepted', 'rejected', 'cancelled'] as const;
export type SimpleReservationStatus = (typeof SIMPLE_RESERVATION_STATUS)[number];

// Simple Reservation Interface
export interface ISimpleReservation extends Document {
  name: string;
  email: string;
  contactNumber: string;
  numberOfGuests: number;
  reservationDate: Date;
  status: SimpleReservationStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simple Reservation Schema
const simpleReservationSchema = new Schema<ISimpleReservation>(
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
      enum: SIMPLE_RESERVATION_STATUS,
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

// Index for efficient queries
simpleReservationSchema.index({ reservationDate: 1 });
simpleReservationSchema.index({ status: 1 });
simpleReservationSchema.index({ email: 1 });
simpleReservationSchema.index({ createdAt: -1 });

export const SimpleReservationModel = model<ISimpleReservation>('SimpleReservation', simpleReservationSchema);

export default SimpleReservationModel;
