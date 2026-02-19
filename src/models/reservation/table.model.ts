import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';
import type { IFloor } from './floor.model';
import type { IRow } from './row.model';

// Table Interface
export interface ITable extends Document {
  name: string;
  capacity: number;
  floor?: Schema.Types.ObjectId | IFloor;
  row?: Schema.Types.ObjectId | IRow;
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
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    floor: {
      type: Schema.Types.ObjectId,
      ref: 'Floor',
    },
    row: {
      type: Schema.Types.ObjectId,
      ref: 'Row',
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
tableSchema.index({ floor: 1 });
tableSchema.index({ row: 1 });
// Compound index: same table name allowed on different floors
tableSchema.index({ name: 1, floor: 1 }, { unique: true, sparse: true });

export const TableModel = model<ITable>('Table', tableSchema);
