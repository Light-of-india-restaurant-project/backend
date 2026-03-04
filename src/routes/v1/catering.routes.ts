import { Router } from 'express';

import CateringController from '../../controllers/catering/catering.controller';
import { adminAuthMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody, validateRequestParams } from '../../middleware/validation.middleware';
import CommonValidator from '../../validators/common.validators';
import CateringValidator from '../../validators/catering.validator';

const cateringRouter = Router();

// ==================== Public Routes ====================

// Get active catering packs (for customer page)
cateringRouter.get('/packs', CateringController.getActivePacks);

// Get single pack details (public)
cateringRouter.get(
  '/packs/:id',
  validateRequestParams(CommonValidator.paramsValidationSchema),
  CateringController.getPackById,
);

// ==================== Admin Routes - Packs ====================

// Get all packs (paginated, including inactive)
cateringRouter.get('/admin/packs', adminAuthMiddleware, CateringController.getAllPacks);

// Create a new pack
cateringRouter.post(
  '/admin/packs',
  adminAuthMiddleware,
  validateRequestBody(CateringValidator.createPackSchema),
  CateringController.createPack,
);

// Update a pack
cateringRouter.put(
  '/admin/packs/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(CateringValidator.updatePackSchema),
  CateringController.updatePack,
);

// Delete a pack
cateringRouter.delete(
  '/admin/packs/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  CateringController.deletePack,
);

// ==================== Admin Routes - Orders ====================

// Get all orders (paginated)
cateringRouter.get('/admin/orders', adminAuthMiddleware, CateringController.getAllOrders);

// Get single order details
cateringRouter.get(
  '/admin/orders/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  CateringController.getOrderById,
);

// Update delivery status
cateringRouter.patch(
  '/admin/orders/:id/status',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(CateringValidator.updateDeliveryStatusSchema),
  CateringController.updateDeliveryStatus,
);

export default cateringRouter;
