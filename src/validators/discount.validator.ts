import { z } from 'zod';

const updateDiscountSchema = z.object({
  percentage: z.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage cannot exceed 100').optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(200, 'Description too long').optional(),
});

const calculateDiscountSchema = z.object({
  orderType: z.enum(['delivery', 'pickup'], { required_error: 'Order type is required' }),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
});

const DiscountValidator = {
  updateDiscountSchema,
  calculateDiscountSchema,
};

export default DiscountValidator;
