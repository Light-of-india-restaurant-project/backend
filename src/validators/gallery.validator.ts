import { z } from 'zod';

import CommonValidator from './common.validators';

// Gallery category enum
const galleryCategoryEnum = z.enum(['food', 'ambiance']);

// Gallery section enum (1 or 2)
const gallerySectionEnum = z.union([z.literal(1), z.literal(2)]);

// Create gallery image schema
const createSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  titleNl: z.string().trim().min(1, 'Dutch title is required'),
  alt: z.string().trim().min(1, 'Alt text is required'),
  altNl: z.string().trim().min(1, 'Dutch alt text is required'),
  category: galleryCategoryEnum,
  imageUrl: z.string().trim().url('Invalid image URL'),
  section: gallerySectionEnum.default(1),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Update gallery image schema
const updateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').optional(),
  titleNl: z.string().trim().min(1, 'Dutch title is required').optional(),
  alt: z.string().trim().min(1, 'Alt text is required').optional(),
  altNl: z.string().trim().min(1, 'Dutch alt text is required').optional(),
  category: galleryCategoryEnum.optional(),
  imageUrl: z.string().trim().url('Invalid image URL').optional(),
  section: gallerySectionEnum.optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// Set featured image schema
const setFeaturedSchema = z.object({
  id: CommonValidator.mongoIdValidation,
  section: gallerySectionEnum,
});

const GalleryValidator = {
  createSchema,
  updateSchema,
  setFeaturedSchema,
};

export default GalleryValidator;
