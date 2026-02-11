import { Schema, model } from 'mongoose';

import { USER_STATUS } from '../../constant/enum';
import { generateHash } from '../../utils/bcrypt';

import type { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  mobile: string;
  fullName?: string;
  address?: string;
  postalCode?: string;
  verified: boolean;
  status: (typeof USER_STATUS)[number];
  createdAt: Date;
  updatedAt: Date;
  // Add role field if you need role-based access control
  // role: string;
}

const userSchema = new Schema<IUser>(
  {
    // Uncomment and customize if you need roles
    // role: {
    //   type: String,
    //   enum: ['admin', 'user'],
    //   default: 'user',
    // },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      // Password validation handled in service/controller for security
    },
    mobile: {
      type: String,
      required: false,
      match: [/^\+[1-9]\d{1,14}$/, 'Invalid international phone number'],
    },
    fullName: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },
    address: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },
    postalCode: {
      type: String,
      required: false,
      trim: true,
      match: [/^[0-9]{4}\s?[A-Za-z]{2}$/, 'Invalid Dutch postal code format (e.g., 1234 AB)'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: USER_STATUS,
      default: 'inactive',
    },
  },
  { timestamps: true },
);

// hash the password before saving to database
userSchema.pre('save', async function savePassword(next) {
  if (!this.isModified()) {
    next();
  }
  const hash = await generateHash(this.password);
  this.password = hash;
});

export const UserModel = model<IUser>('user', userSchema);
