import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Catering Pack Category enum
export const CATERING_CATEGORY = ['vegetarian', 'non-vegetarian', 'mixed'] as const;
export type CateringCategory = (typeof CATERING_CATEGORY)[number];

// Delivery Status enum
export const DELIVERY_STATUS = ['yet_to_be_delivered', 'delivered'] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUS)[number];

// Catering Pack Interface
export interface ICateringPack extends Document {
  name: string;
  description: string;
  descriptionNl: string;
  category: CateringCategory;
  pricePerPerson: number;
  minPeople: number;
  menuItems: Schema.Types.ObjectId[];
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Catering Order Interface
export interface ICateringOrder extends Document {
  orderNumber: string;
  cateringPack: Schema.Types.ObjectId;
  peopleCount: number;
  totalPrice: number;
  deliveryDate: Date;
  deliveryTime: string;
  deliveryAddress: {
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    additionalInfo?: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  paymentId?: string;
  deliveryStatus: DeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Catering Pack Schema
const cateringPackSchema = new Schema<ICateringPack>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionNl: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: CATERING_CATEGORY,
      required: true,
    },
    pricePerPerson: {
      type: Number,
      required: true,
      min: 0,
    },
    minPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    menuItems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
    ],
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Catering Order Schema
const cateringOrderSchema = new Schema<ICateringOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    cateringPack: {
      type: Schema.Types.ObjectId,
      ref: 'CateringPack',
      required: true,
    },
    peopleCount: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    deliveryTime: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      street: { type: String, required: true, trim: true },
      houseNumber: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      additionalInfo: { type: String, trim: true },
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'expired', 'cancelled'],
      default: 'pending',
    },
    paymentId: {
      type: String,
      trim: true,
    },
    deliveryStatus: {
      type: String,
      enum: DELIVERY_STATUS,
      default: 'yet_to_be_delivered',
    },
  },
  { timestamps: true },
);

// Generate order number before saving
cateringOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Count orders for today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await CateringOrderModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    this.orderNumber = `CAT-${dateStr}-${sequence}`;
  }
  next();
});

// Create indexes
cateringPackSchema.index({ isActive: 1, sortOrder: 1 });
cateringOrderSchema.index({ orderNumber: 1 });
cateringOrderSchema.index({ deliveryStatus: 1 });
cateringOrderSchema.index({ deliveryDate: 1 });
cateringOrderSchema.index({ paymentStatus: 1 });

// Export models
export const CateringPackModel = model<ICateringPack>('CateringPack', cateringPackSchema);
export const CateringOrderModel = model<ICateringOrder>('CateringOrder', cateringOrderSchema);

export default { CateringPackModel, CateringOrderModel };
