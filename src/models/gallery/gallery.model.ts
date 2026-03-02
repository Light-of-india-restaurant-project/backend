import { Schema, model } from 'mongoose';

import type { Document } from 'mongoose';

// Gallery Category enum
export const GALLERY_CATEGORY = ['food', 'ambiance'] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORY)[number];

// Gallery Section enum (1 or 2)
export const GALLERY_SECTION = [1, 2] as const;
export type GallerySection = (typeof GALLERY_SECTION)[number];

// Gallery Image Interface
export interface IGalleryImage extends Document {
  title: string;
  titleNl: string;
  alt: string;
  altNl: string;
  category: GalleryCategory;
  imageUrl: string;
  section: GallerySection;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Gallery Image Schema
const galleryImageSchema = new Schema<IGalleryImage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleNl: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
    altNl: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: GALLERY_CATEGORY,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: Number,
      enum: GALLERY_SECTION,
      required: true,
      default: 1,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Create indexes
galleryImageSchema.index({ section: 1, sortOrder: 1 });
galleryImageSchema.index({ section: 1, isFeatured: 1 });
galleryImageSchema.index({ category: 1 });
galleryImageSchema.index({ isActive: 1 });

// Export model
export const GalleryImage = model<IGalleryImage>('GalleryImage', galleryImageSchema);
export default GalleryImage;
