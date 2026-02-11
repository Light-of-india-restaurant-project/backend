import { Router } from 'express';

import AdminController from '../../controllers/admin/admin.controller';
import { adminAuthMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody } from '../../middleware/validation.middleware';
import AdminValidator from '../../validators/admin.validator';

const adminRouter = Router();

// Public routes
adminRouter.post('/login', validateRequestBody(AdminValidator.adminLoginSchema), AdminController.loginAdmin);

// Protected routes (require admin authentication)
adminRouter.get('/me', adminAuthMiddleware, AdminController.getAdminProfile);

// Create admin (should be protected in production - for now open for initial setup)
adminRouter.post('/create', validateRequestBody(AdminValidator.adminCreateSchema), AdminController.createAdmin);

export default adminRouter;
