import createMollieClient, { PaymentMethod } from '@mollie/api-client';

import { MOLLIE_CONFIG } from '../../config/mollie.config';
import { MenuItemModel } from '../../models/menu/menu.model';
import { OrderModel } from '../../models/order/order.model';
import createError from '../../utils/http.error';

import type { IOrderItem } from '../../models/order/order.model';

// Initialize Mollie client
const mollieClient = createMollieClient({ apiKey: MOLLIE_CONFIG.apiKey });

// Interface for payment initiation payload (same as order payload)
interface InitiatePaymentPayload {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  pickupTime?: string;
  notes?: string;
}

// Interface for order metadata stored in Mollie payment
interface OrderMetadata {
  userId: string;
  items: IOrderItem[];
  subtotal: number;
  total: number;
  pickupTime?: string;
  notes?: string;
}

/**
 * Create a Mollie payment session
 * Stores order data in payment metadata - order is only created after successful payment
 */
const initiatePayment = async ({
  userId,
  payload,
}: {
  userId: string;
  payload: InitiatePaymentPayload;
}): Promise<{ paymentUrl: string; paymentId: string }> => {
  // Validate items exist
  if (!payload.items || payload.items.length === 0) {
    throw createError(400, 'Order must have at least one item');
  }

  // Fetch menu items to validate and get prices
  const menuItemIds = payload.items.map((item) => item.menuItemId);
  const menuItems = await MenuItemModel.find({
    _id: { $in: menuItemIds },
    isActive: true,
    menuType: { $in: ['takeaway', 'both'] },
  }).lean();

  // Validate all items exist and are available for takeaway
  if (menuItems.length !== menuItemIds.length) {
    throw createError(400, 'Some items are not available for takeaway');
  }

  // Build order items with current prices
  const orderItems: IOrderItem[] = payload.items.map((item) => {
    const menuItem = menuItems.find((mi: any) => mi._id.toString() === item.menuItemId);
    if (!menuItem) {
      throw createError(400, `Menu item ${item.menuItemId} not found`);
    }
    return {
      menuItemId: (menuItem as any)._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    };
  });

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // Add tax/fees here if needed

  // Create metadata to store in Mollie payment
  const metadata: OrderMetadata = {
    userId,
    items: orderItems,
    subtotal,
    total,
    pickupTime: payload.pickupTime,
    notes: payload.notes,
  };

  // Create Mollie payment
  // Note: We'll update the redirect URL after getting the payment ID
  const payment = await mollieClient.payments.create({
    amount: {
      currency: 'EUR',
      value: total.toFixed(2), // Mollie requires string with 2 decimal places
    },
    description: `Light of India - Order`,
    redirectUrl: `${MOLLIE_CONFIG.redirectUrl}/payment/success`,
    webhookUrl: MOLLIE_CONFIG.webhookUrl,
    metadata: JSON.stringify(metadata),
    method: [PaymentMethod.ideal, PaymentMethod.creditcard, PaymentMethod.bancontact, PaymentMethod.eps],
  });

  if (!payment._links.checkout?.href) {
    throw createError(500, 'Failed to create payment session');
  }

  // Update the payment with the correct redirect URL including the payment ID
  await mollieClient.payments.update(payment.id, {
    redirectUrl: `${MOLLIE_CONFIG.redirectUrl}/payment/success?paymentId=${payment.id}`,
  });

  return {
    paymentUrl: payment._links.checkout.href,
    paymentId: payment.id,
  };
};

/**
 * Handle Mollie webhook callback
 * Creates the order after successful payment
 */
const handleWebhook = async (paymentId: string): Promise<void> => {
  // Get payment details from Mollie
  const payment = await mollieClient.payments.get(paymentId);

  // Check if order already exists for this payment (idempotency)
  const existingOrder = await OrderModel.findOne({ paymentId });
  if (existingOrder) {
    // Update payment status if it has changed
    if (payment.status === 'paid' && existingOrder.paymentStatus !== 'paid') {
      existingOrder.paymentStatus = 'paid';
      existingOrder.paymentMethod = payment.method?.toString() || 'mollie';
      existingOrder.status = 'confirmed';
      await existingOrder.save();
    } else if (payment.status === 'failed' && existingOrder.paymentStatus !== 'failed') {
      existingOrder.paymentStatus = 'failed';
      await existingOrder.save();
    } else if (payment.status === 'expired' && existingOrder.paymentStatus !== 'expired') {
      existingOrder.paymentStatus = 'expired';
      await existingOrder.save();
    } else if (payment.status === 'canceled' && existingOrder.paymentStatus !== 'cancelled') {
      existingOrder.paymentStatus = 'cancelled';
      await existingOrder.save();
    }
    return;
  }

  // Only create order if payment is successful
  if (payment.status !== 'paid') {
    return;
  }

  // Parse metadata
  const metadata: OrderMetadata = JSON.parse(payment.metadata as string);

  // Generate order number
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  const orderNumber = `ORD-${dateStr}-${random}`;

  // Create the order
  const order = new OrderModel({
    orderNumber,
    userId: metadata.userId,
    items: metadata.items,
    subtotal: metadata.subtotal,
    total: metadata.total,
    status: 'confirmed', // Order is confirmed upon successful payment
    pickupTime: metadata.pickupTime ? new Date(metadata.pickupTime) : undefined,
    notes: metadata.notes,
    paymentId: payment.id,
    paymentStatus: 'paid',
    paymentMethod: payment.method?.toString() || 'mollie',
  });

  await order.save();
};

/**
 * Get payment status
 * Also creates order if payment is successful but order doesn't exist (fallback for webhook delays)
 */
const getPaymentStatus = async (
  paymentId: string,
): Promise<{
  status: string;
  isPaid: boolean;
  order?: {
    orderNumber: string;
    orderId: string;
  };
}> => {
  // First check if we have an order with this payment ID
  let order = await OrderModel.findOne({ paymentId });

  if (order) {
    return {
      status: order.paymentStatus,
      isPaid: order.paymentStatus === 'paid',
      order: {
        orderNumber: order.orderNumber,
        orderId: (order._id as string).toString(),
      },
    };
  }

  // If no order yet, check Mollie directly
  const payment = await mollieClient.payments.get(paymentId);

  // If payment is successful but no order exists, create it now (fallback for webhook delays)
  if (payment.status === 'paid' && payment.metadata) {
    const metadata: OrderMetadata = JSON.parse(payment.metadata as string);

    // Generate order number
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${random}`;

    // Create the order
    order = new OrderModel({
      orderNumber,
      userId: metadata.userId,
      items: metadata.items,
      subtotal: metadata.subtotal,
      total: metadata.total,
      status: 'confirmed',
      pickupTime: metadata.pickupTime ? new Date(metadata.pickupTime) : undefined,
      notes: metadata.notes,
      paymentId: payment.id,
      paymentStatus: 'paid',
      paymentMethod: payment.method?.toString() || 'mollie',
    });

    await order.save();

    return {
      status: 'paid',
      isPaid: true,
      order: {
        orderNumber: order.orderNumber,
        orderId: (order._id as string).toString(),
      },
    };
  }

  return {
    status: payment.status,
    isPaid: payment.status === 'paid',
  };
};

const PaymentService = {
  initiatePayment,
  handleWebhook,
  getPaymentStatus,
};

export default PaymentService;
