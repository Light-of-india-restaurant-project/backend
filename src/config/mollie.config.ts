// Mollie Payment Gateway Configuration
export const MOLLIE_CONFIG = {
  apiKey: process.env.MOLLIE_API_KEY || '',
  redirectUrl: process.env.MOLLIE_REDIRECT_URL || 'http://localhost:8080',
  webhookUrl: process.env.MOLLIE_WEBHOOK_URL || 'http://localhost:3000/api/v1/payments/webhook',
  cancelUrl: process.env.MOLLIE_CANCEL_URL || 'http://localhost:8080/payment/cancelled',
};

// Validate Mollie configuration
export const validateMollieConfig = (): boolean => {
  if (!MOLLIE_CONFIG.apiKey) {
    console.warn('Warning: MOLLIE_API_KEY is not set');
    return false;
  }
  return true;
};
