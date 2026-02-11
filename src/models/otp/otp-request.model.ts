import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

export interface IOtpRequest extends Document {
  user: Schema.Types.ObjectId;
  otpType: 'phone_verification' | 'email_verification' | 'purchase_confirmation' | 'password_reset' | 'two_factor_auth';
  phoneNumber?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'sent' | 'verified' | 'failed' | 'expired';
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpRequestSchema = new Schema<IOtpRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true, // Index for efficient user queries
    },
    otpType: {
      type: String,
      enum: ['phone_verification', 'email_verification', 'purchase_confirmation', 'password_reset', 'two_factor_auth'],
      required: true,
      index: true, // Index for filtering by type
    },
    phoneNumber: {
      type: String,
      trim: true,
      sparse: true, // Sparse index for optional field
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Sparse index for optional field
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'verified', 'failed', 'expired'],
      default: 'sent',
      required: true,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    // Add compound indexes for efficient rate limiting queries
  },
);

// Compound indexes for rate limiting queries
otpRequestSchema.index({ user: 1, otpType: 1, createdAt: -1 }); // For user + type based rate limiting
otpRequestSchema.index({ user: 1, createdAt: -1 }); // For overall user rate limiting
otpRequestSchema.index({ createdAt: -1 }); // For cleanup and analytics

// TTL index to automatically delete old tracking records after 90 days (longer retention for audit)
otpRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90 days

export const OtpRequestModel = model<IOtpRequest>('otpRequest', otpRequestSchema);
