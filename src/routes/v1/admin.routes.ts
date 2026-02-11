import { Router } from 'express';

import AdminController from '../../controllers/admin/admin.controller';
import AdminOrderController from '../../controllers/admin/admin-order.controller';
import { adminAuthMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody } from '../../middleware/validation.middleware';
import AdminValidator from '../../validators/admin.validator';
import OrderValidator from '../../validators/order.validator';

const adminRouter = Router();

// Public routes
adminRouter.post('/login', validateRequestBody(AdminValidator.adminLoginSchema), AdminController.loginAdmin);

// Protected routes (require admin authentication)
adminRouter.get('/me', adminAuthMiddleware, AdminController.getAdminProfile);

// Create admin (should be protected in production - for now open for initial setup)
adminRouter.post('/create', validateRequestBody(AdminValidator.adminCreateSchema), AdminController.createAdmin);

// Order management routes (admin)
adminRouter.get('/orders', adminAuthMiddleware, AdminOrderController.getAllOrders);
adminRouter.get('/orders/:id', adminAuthMiddleware, AdminOrderController.getOrderById);
adminRouter.patch('/orders/:id/status', adminAuthMiddleware, validateRequestBody(OrderValidator.updateOrderStatusSchema), AdminOrderController.updateOrderStatus);

export default adminRouter;
