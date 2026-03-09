import { z } from 'zod';

// ==================== Offer Validators ====================

// Custom validator for image - accepts URL or base64 data URI
const imageSchema = z.string().refine(
  (val) => {
    if (!val) return true;
    // Accept base64 data URIs
    if (val.startsWith('data:image/')) return true;
    // Accept URLs
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid image - must be a valid URL or uploaded image' }
);

// Custom validator for datetime - accepts ISO format or datetime-local format
const datetimeSchema = z.string().refine(
  (val) => {
    if (!val) return true;
    // Try parsing as date
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid datetime format' }
);

const offerCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description (English) is required'),
  descriptionNl: z.string().trim().min(1, 'Description (Dutch) is required'),
  price: z.number().positive('Price must be positive'),
  image: imageSchema.optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  validFrom: datetimeSchema.optional(),
  validUntil: datetimeSchema.optional(),
});

const offerUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z.string().trim().min(1, 'Description (English) is required').optional(),
  descriptionNl: z.string().trim().min(1, 'Description (Dutch) is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  image: imageSchema.optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  validFrom: datetimeSchema.optional().nullable(),
  validUntil: datetimeSchema.optional().nullable(),
});

const OfferValidator = {
  offerCreateSchema,
  offerUpdateSchema,
};

export default OfferValidator;
