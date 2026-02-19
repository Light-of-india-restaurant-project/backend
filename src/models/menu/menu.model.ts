import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Menu Type enum
export const MENU_TYPE = ['takeaway', 'dine-in', 'both'] as const;
export type MenuType = (typeof MENU_TYPE)[number];

// Menu Category Interface
export interface IMenuCategory extends Document {
  name: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Menu Item Interface
export interface IMenuItem extends Document {
  name: string;
  description: string;
  descriptionNl: string;
  price: number;
  category: Schema.Types.ObjectId;
  menuType: MenuType;
  image?: string;
  isVegetarian: boolean;
  isSpicy: boolean;
  isDoubleSpicy: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Menu Category Schema
const menuCategorySchema = new Schema<IMenuCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
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

// Menu Item Schema
const menuItemSchema = new Schema<IMenuItem>(
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
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: true,
    },
    menuType: {
      type: String,
      enum: MENU_TYPE,
      default: 'both',
    },
    image: {
      type: String,
      trim: true,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isSpicy: {
      type: Boolean,
      default: false,
    },
    isDoubleSpicy: {
      type: Boolean,
      default: false,
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

export const MenuCategoryModel = model<IMenuCategory>('MenuCategory', menuCategorySchema);
export const MenuItemModel = model<IMenuItem>('MenuItem', menuItemSchema);
