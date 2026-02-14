import { Router } from 'express';

import OrderController from '../../controllers/order/order.controller';
import { authenticationMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody } from '../../middleware/validation.middleware';
import OrderValidator from '../../validators/order.validator';

const orderRouter = Router();

// Public route - Check delivery area by postal code (no auth required)
orderRouter.get('/check-delivery-area/:postalCode', OrderController.checkDeliveryArea);

// All order routes below require authentication
orderRouter.use(authenticationMiddleware);

// Create a new order
orderRouter.post('/', validateRequestBody(OrderValidator.createOrderSchema), OrderController.createOrder);

// Get user's orders
orderRouter.get('/', OrderController.getUserOrders);

// Get single order
orderRouter.get('/:id', OrderController.getOrderById);

// Cancel order
orderRouter.delete('/:id', OrderController.cancelOrder);

export default orderRouter;
