import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Order Status enum
export const ORDER_STATUS = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

// Order Item Interface
export interface IOrderItem {
  menuItemId: Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

// Order Interface
export interface IOrder extends Document {
  orderNumber: string;
  userId: Schema.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  pickupTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Item Schema
const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

// Order Schema
const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ORDER_STATUS,
      default: 'pending',
    },
    pickupTime: {
      type: Date,
      required: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

// Generate order number before saving
orderSchema.pre('save', async function generateOrderNumber(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.orderNumber = `ORD-${dateStr}-${random}`;
  }
  next();
});

// Index for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

export const OrderModel = model<IOrder>('Order', orderSchema);
