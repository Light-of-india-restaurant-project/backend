import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';
import type { IFloor } from './floor.model';

// Row Interface
export interface IRow extends Document {
  name: string;
  rowNumber: number;
  floor: Schema.Types.ObjectId | IFloor;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Row Schema
const rowSchema = new Schema<IRow>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rowNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
    floor: {
      type: Schema.Types.ObjectId,
      ref: 'Floor',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Indexes
rowSchema.index({ floor: 1, rowNumber: 1 }, { unique: true });
rowSchema.index({ floor: 1 });
rowSchema.index({ isActive: 1 });

export const RowModel = model<IRow>('Row', rowSchema);
