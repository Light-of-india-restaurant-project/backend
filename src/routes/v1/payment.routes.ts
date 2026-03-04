import { Router } from 'express';

import PaymentController from '../../controllers/payment/payment.controller';
import { authenticationMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody } from '../../middleware/validation.middleware';
import OrderValidator from '../../validators/order.validator';
import CateringValidator from '../../validators/catering.validator';

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

// ==================== Catering Payment Routes ====================

// Initiate catering payment (no auth required - public catering orders)
paymentRouter.post(
  '/catering/initiate',
  validateRequestBody(CateringValidator.createOrderSchema),
  PaymentController.initiateCateringPayment,
);

// Get catering payment status
paymentRouter.get('/catering/:paymentId/status', PaymentController.getCateringPaymentStatus);

export default paymentRouter;
