import { Router } from 'express';

import GalleryController from '../../controllers/gallery/gallery.controller';
import { adminAuthMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody, validateRequestParams } from '../../middleware/validation.middleware';
import CommonValidator from '../../validators/common.validators';
import GalleryValidator from '../../validators/gallery.validator';

const galleryRouter = Router();

// ==================== Public Routes ====================
// Get active gallery images (for landing page)
galleryRouter.get('/', GalleryController.getActive);

// ==================== Admin Routes ====================
// Get all gallery images (including inactive)
galleryRouter.get('/admin', adminAuthMiddleware, GalleryController.getAll);

// Get gallery image by ID
galleryRouter.get(
  '/admin/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  GalleryController.getById,
);

// Create gallery image
galleryRouter.post(
  '/admin',
  adminAuthMiddleware,
  validateRequestBody(GalleryValidator.createSchema),
  GalleryController.create,
);

// Update gallery image
galleryRouter.put(
  '/admin/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(GalleryValidator.updateSchema),
  GalleryController.update,
);

// Delete gallery image
galleryRouter.delete(
  '/admin/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  GalleryController.deleteById,
);

// Set featured image for a section
galleryRouter.post(
  '/admin/set-featured',
  adminAuthMiddleware,
  validateRequestBody(GalleryValidator.setFeaturedSchema),
  GalleryController.setFeatured,
);

export default galleryRouter;
