import { Router } from 'express';

import PaymentController from '../../controllers/payment/payment.controller';
import { authenticationMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody } from '../../middleware/validation.middleware';
import OrderValidator from '../../validators/order.validator';

const paymentRouter = Router();

// Initiate payment (requires authentication)
paymentRouter.post(
  '/initiate',
  authenticationMiddleware,
  validateRequestBody(OrderValidator.createOrderSchema), // Uses same validation as order
  PaymentController.initiatePayment,
);

// Mollie webhook (no authentication - Mollie calls this)
paymentRouter.post('/webhook', PaymentController.handleWebhook);

// Get payment status (no auth required - frontend needs to check after redirect)
paymentRouter.get('/:paymentId/status', PaymentController.getPaymentStatus);

export default paymentRouter;
