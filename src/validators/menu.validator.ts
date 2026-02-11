import { z } from 'zod';

import CommonValidator from './common.validators';

// Menu Type enum
const menuTypeEnum = z.enum(['takeaway', 'dine-in', 'both']);

// ==================== Category Validators ====================

const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  icon: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  icon: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// ==================== Item Validators ====================

const itemCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  category: CommonValidator.mongoIdValidation,
  menuType: menuTypeEnum.default('both'),
  image: z.string().url('Invalid image URL').optional(),
  isVegetarian: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const itemUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z.string().trim().min(1, 'Description is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  category: CommonValidator.mongoIdValidation.optional(),
  menuType: menuTypeEnum.optional(),
  image: z.string().url('Invalid image URL').optional().nullable(),
  isVegetarian: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const MenuValidator = {
  categoryCreateSchema,
  categoryUpdateSchema,
  itemCreateSchema,
  itemUpdateSchema,
};

export default MenuValidator;
