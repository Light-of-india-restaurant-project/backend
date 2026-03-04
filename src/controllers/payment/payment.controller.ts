import PaymentService from '../../services/payment/payment.service';

import type { CustomRequest } from '../../interfaces/auth.interface';
import type { Response, NextFunction, Request } from 'express';

/**
 * Initiate a payment session
 * POST /api/v1/payments/initiate
 */
const initiatePayment = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await PaymentService.initiatePayment({
      userId: req.user,
      payload: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Payment session created',
      paymentUrl: result.paymentUrl,
      paymentId: result.paymentId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Mollie webhook
 * POST /api/v1/payments/webhook
 * This endpoint is called by Mollie, not authenticated
 */
const handleWebhook = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  console.log('Webhook received:', req.body);
  try {
    const { id } = req.body;

    if (!id) {
      console.log('Webhook error: No payment ID in request body');
      res.status(400).json({ success: false, message: 'Payment ID required' });
      return;
    }

    console.log('Processing webhook for payment:', id);
    await PaymentService.handleWebhook(id);
    console.log('Webhook processed successfully for payment:', id);

    // Mollie expects a 200 response
    res.status(200).send('OK');
  } catch (error) {
    // Log error but still return 200 to Mollie to prevent retries
    console.error('Webhook error:', error);
    res.status(200).send('OK');
  }
};

/**
 * Get payment status
 * GET /api/v1/payments/:paymentId/status
 */
const getPaymentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentId = req.params.paymentId as string;

    if (!paymentId) {
      res.status(400).json({ success: false, message: 'Payment ID required' });
      return;
    }

    const result = await PaymentService.getPaymentStatus(paymentId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate a catering payment session
 * POST /api/v1/payments/catering/initiate
 * No authentication required - customers don't need to be logged in
 */
const initiateCateringPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await PaymentService.initiateCateringPayment({
      payload: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Catering payment session created',
      paymentUrl: result.paymentUrl,
      paymentId: result.paymentId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get catering payment status
 * GET /api/v1/payments/catering/:paymentId/status
 */
const getCateringPaymentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentId = req.params.paymentId as string;

    if (!paymentId) {
      res.status(400).json({ success: false, message: 'Payment ID required' });
      return;
    }

    const result = await PaymentService.getCateringPaymentStatus(paymentId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const PaymentController = {
  initiatePayment,
  handleWebhook,
  getPaymentStatus,
  initiateCateringPayment,
  getCateringPaymentStatus,
};

export default PaymentController;
