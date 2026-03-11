import { Router } from 'express';

import DiscountController from '../../controllers/discount/discount.controller';
import { adminAuthMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody } from '../../middleware/validation.middleware';
import DiscountValidator from '../../validators/discount.validator';

const discountRouter = Router();

// Public routes
// Get active discounts (for frontend to show discount info)
discountRouter.get('/active', DiscountController.getActiveDiscounts);

// Calculate discount for an order
discountRouter.post(
  '/calculate',
  validateRequestBody(DiscountValidator.calculateDiscountSchema),
  DiscountController.calculateDiscount,
);

// Admin routes (require authentication)
// Get all discounts
discountRouter.get('/', adminAuthMiddleware, DiscountController.getAllDiscounts);

// Update discount by type (delivery or pickup)
discountRouter.patch(
  '/:type',
  adminAuthMiddleware,
  validateRequestBody(DiscountValidator.updateDiscountSchema),
  DiscountController.updateDiscountByType,
);

// Toggle discount active status
discountRouter.patch('/:id/toggle', adminAuthMiddleware, DiscountController.toggleDiscountStatus);

export default discountRouter;
