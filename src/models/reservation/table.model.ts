import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Table Interface
export interface ITable extends Document {
  name: string;
  capacity: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Table Schema
const tableSchema = new Schema<ITable>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
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
tableSchema.index({ isActive: 1 });
tableSchema.index({ capacity: 1 });

export const TableModel = model<ITable>('Table', tableSchema);
