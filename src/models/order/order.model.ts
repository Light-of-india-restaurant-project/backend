import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Order Status enum
export const ORDER_STATUS = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

// Payment Status enum
export const PAYMENT_STATUS = ['pending', 'paid', 'failed', 'expired', 'cancelled'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

// Order Item Interface
export interface IOrderItem {
  menuItemId: Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

// Catering Pack Order Item Interface
export interface ICateringOrderItem {
  packId: Schema.Types.ObjectId;
  name: string;
  pricePerPerson: number;
  peopleCount: number;
  quantity: number;
}

// Offer Order Item Interface
export interface IOfferOrderItem {
  offerId: Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

// Delivery Address Interface
export interface IDeliveryAddress {
  postalCode: string;
  streetName: string;
  houseNumber: string;
  city: string;
}

// Order Interface
export interface IOrder extends Document {
  orderNumber: string;
  userId: Schema.Types.ObjectId;
  email: string;
  items: IOrderItem[];
  cateringItems?: ICateringOrderItem[];
  offerItems?: IOfferOrderItem[];
  subtotal: number;
  total: number;
  deliveryCharge: number;
  status: OrderStatus;
  pickupTime?: Date;
  notes?: string;
  // Pickup flag
  isPickup?: boolean;
  // Delivery fields (optional for pickup orders)
  deliveryAddress?: IDeliveryAddress;
  contactMobile: string;
  // Payment fields
  paymentId?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  visitedByAdmin: boolean;
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

// Catering Order Item Schema
const cateringOrderItemSchema = new Schema<ICateringOrderItem>(
  {
    packId: {
      type: Schema.Types.ObjectId,
      ref: 'CateringPack',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    pricePerPerson: {
      type: Number,
      required: true,
    },
    peopleCount: {
      type: Number,
      required: true,
      min: 1,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

// Offer Order Item Schema
const offerOrderItemSchema = new Schema<IOfferOrderItem>(
  {
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
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
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    cateringItems: {
      type: [cateringOrderItemSchema],
      default: [],
    },
    offerItems: {
      type: [offerOrderItemSchema],
      default: [],
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
    deliveryCharge: {
      type: Number,
      default: 0,
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
    // Pickup flag
    isPickup: {
      type: Boolean,
      default: false,
    },
    // Delivery fields (optional for pickup orders)
    deliveryAddress: {
      postalCode: {
        type: String,
        required: false,
        trim: true,
      },
      streetName: {
        type: String,
        required: false,
        trim: true,
      },
      houseNumber: {
        type: String,
        required: false,
        trim: true,
      },
      city: {
        type: String,
        required: false,
        trim: true,
        default: 'Rotterdam',
      },
    },
    contactMobile: {
      type: String,
      required: true,
      trim: true,
    },
    // Payment fields
    paymentId: {
      type: String,
      required: false,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    visitedByAdmin: {
      type: Boolean,
      default: false,
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
  
  // Validate that at least one item (menu, catering, or offer) exists
  if (this.isNew) {
    const hasMenuItems = this.items && this.items.length > 0;
    const hasCateringItems = this.cateringItems && this.cateringItems.length > 0;
    const hasOfferItems = this.offerItems && this.offerItems.length > 0;
    if (!hasMenuItems && !hasCateringItems && !hasOfferItems) {
      return next(new Error('Order must have at least one menu item, catering pack, or offer'));
    }
  }
  
  next();
});

// Index for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

export const OrderModel = model<IOrder>('Order', orderSchema);
