import { Router } from 'express';

import DeliveryZoneController from '../../controllers/delivery/delivery-zone.controller';
import { adminAuthMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody } from '../../middleware/validation.middleware';
import DeliveryZoneValidator from '../../validators/delivery-zone.validator';

const deliveryZoneRouter = Router();

// Public routes
// Check if postal code is deliverable
deliveryZoneRouter.get('/check/:postalCode', DeliveryZoneController.checkPostalCode);

// Get active delivery zones (for showing on frontend)
deliveryZoneRouter.get('/active', DeliveryZoneController.getActiveDeliveryZones);

// Admin routes (require authentication)
// Get all delivery zones (including inactive)
deliveryZoneRouter.get('/', adminAuthMiddleware, DeliveryZoneController.getAllDeliveryZones);

// Get single delivery zone
deliveryZoneRouter.get('/:id', adminAuthMiddleware, DeliveryZoneController.getDeliveryZoneById);

// Create delivery zone
deliveryZoneRouter.post(
  '/',
  adminAuthMiddleware,
  validateRequestBody(DeliveryZoneValidator.createDeliveryZoneSchema),
  DeliveryZoneController.createDeliveryZone,
);

// Update delivery zone
deliveryZoneRouter.patch(
  '/:id',
  adminAuthMiddleware,
  validateRequestBody(DeliveryZoneValidator.updateDeliveryZoneSchema),
  DeliveryZoneController.updateDeliveryZone,
);

// Toggle active status
deliveryZoneRouter.patch('/:id/toggle', adminAuthMiddleware, DeliveryZoneController.toggleDeliveryZoneStatus);

// Delete delivery zone
deliveryZoneRouter.delete('/:id', adminAuthMiddleware, DeliveryZoneController.deleteDeliveryZone);

export default deliveryZoneRouter;
