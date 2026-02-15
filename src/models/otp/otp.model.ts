import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

export interface IOtp extends Document {
  user: Schema.Types.ObjectId;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
  },
  { timestamps: true },
);

// TTL index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = model<IOtp>('otp', otpSchema);
