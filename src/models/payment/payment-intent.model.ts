import { Schema, model } from 'mongoose';

export interface IPaymentIntent {
  idempotencyKey: string;
  scope: 'order' | 'catering';
  payload?: string;
  paymentId?: string;
  paymentUrl?: string;
  lockToken?: string;
  lockUntil?: Date;
}

const paymentIntentSchema = new Schema<IPaymentIntent>(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ['order', 'catering'],
      required: true,
    },
    payload: {
      type: String,
    },
    paymentId: {
      type: String,
      trim: true,
    },
    paymentUrl: {
      type: String,
      trim: true,
    },
    lockToken: {
      type: String,
      trim: true,
    },
    lockUntil: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const PaymentIntentModel = model<IPaymentIntent>('PaymentIntent', paymentIntentSchema);
