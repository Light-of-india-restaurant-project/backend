import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Reservation Status enum
export const RESERVATION_STATUS = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'] as const;
export type ReservationStatus = (typeof RESERVATION_STATUS)[number];

// Reservation Interface
export interface IReservation extends Document {
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: string; // HH:mm format
  endTime: string; // HH:mm format - calculated from duration
  guests: number;
  tableId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId; // Optional - for logged in users
  status: ReservationStatus;
  confirmationCode: string;
  specialRequests?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reservation Schema
const reservationSchema = new Schema<IReservation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    status: {
      type: String,
      enum: RESERVATION_STATUS,
      default: 'pending',
    },
    confirmationCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

// Indexes for efficient queries
reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ tableId: 1, date: 1 });
reservationSchema.index({ confirmationCode: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ email: 1 });
reservationSchema.index({ userId: 1 });

export const ReservationModel = model<IReservation>('Reservation', reservationSchema);
