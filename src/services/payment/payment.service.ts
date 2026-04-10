import createMollieClient, { PaymentMethod } from '@mollie/api-client';

import { MOLLIE_CONFIG } from '../../config/mollie.config';
import { MenuItemModel } from '../../models/menu/menu.model';
import { OfferModel } from '../../models/offer/offer.model';
import { OrderModel } from '../../models/order/order.model';
import { CateringPackModel, CateringOrderModel } from '../../models/catering/catering.model';
import createError from '../../utils/http.error';
import DeliveryZoneService from '../delivery/delivery-zone.service';
import DiscountService from '../discount/discount.service';
import EmailService from '../email/email.service';
import { RestaurantSettingsService } from '../reservation/restaurant-settings.service';

import type { IDeliveryAddress, IOrderItem, ICateringOrderItem, IOfferOrderItem } from '../../models/order/order.model';

// Lazy-initialize Mollie client (avoids crash when API key is not configured)
let _mollieClient: ReturnType<typeof createMollieClient> | null = null;
const getMollieClient = () => {
  if (!_mollieClient) {
    if (!MOLLIE_CONFIG.apiKey) {
      throw createError(500, 'Mollie API key is not configured. Set MOLLIE_API_KEY in your .env file.');
    }
    _mollieClient = createMollieClient({ apiKey: MOLLIE_CONFIG.apiKey });
  }
  return _mollieClient;
};

// Interface for payment initiation payload (same as order payload)
interface InitiatePaymentPayload {
  items?: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  cateringItems?: Array<{
    packId: string;
    peopleCount: number;
    quantity: number;
  }>;
  offerItems?: Array<{
    offerId: string;
    quantity: number;
  }>;
  isPickup?: boolean;
  pickupTime?: string;
  notes?: string;
  deliveryAddress?: IDeliveryAddress;
  contactMobile: string;
  email: string;
}

// Interface for order metadata stored in Mollie payment
interface OrderMetadata {
  userId: string;
  email: string;
  items: IOrderItem[];
  cateringItems?: ICateringOrderItem[];
  offerItems?: IOfferOrderItem[];
  subtotal: number;
  total: number;
  deliveryCharge: number;
  isPickup?: boolean;
  pickupTime?: string;
  notes?: string;
  deliveryAddress?: IDeliveryAddress;
  contactMobile: string;
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
  // Validate that at least one item (menu, catering, or offer) exists
  const hasMenuItems = payload.items && payload.items.length > 0;
  const hasCateringItems = payload.cateringItems && payload.cateringItems.length > 0;
  const hasOfferItems = payload.offerItems && payload.offerItems.length > 0;
  
  if (!hasMenuItems && !hasCateringItems && !hasOfferItems) {
    throw createError(400, 'Order must have at least one menu item, catering pack, or offer');
  }

  // Validate delivery address postal code is in an active delivery zone (only for delivery orders)
  if (!payload.isPickup) {
    if (!payload.deliveryAddress) {
      throw createError(400, 'Delivery address is required for delivery orders');
    }
    const deliveryCheck = await DeliveryZoneService.checkPostalCodeDeliverable(payload.deliveryAddress.postalCode);
    if (!deliveryCheck.deliverable) {
      throw createError(400, deliveryCheck.message);
    }
  }

  let orderItems: IOrderItem[] = [];
  let cateringOrderItems: ICateringOrderItem[] = [];
  let offerOrderItems: IOfferOrderItem[] = [];
  let menuSubtotal = 0;
  let cateringSubtotal = 0;
  let offerSubtotal = 0;

  // Process menu items if present
  if (hasMenuItems) {
    const menuItemIds = payload.items!.map((item) => item.menuItemId);
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
    orderItems = payload.items!.map((item) => {
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

    menuSubtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // Process catering items if present
  if (hasCateringItems) {
    const packIds = payload.cateringItems!.map((item) => item.packId);
    const packs = await CateringPackModel.find({
      _id: { $in: packIds },
      isActive: true,
    }).lean();

    // Validate all packs exist and are active
    if (packs.length !== packIds.length) {
      throw createError(400, 'Some catering packs are not available');
    }

    // Build catering order items with current prices
    cateringOrderItems = payload.cateringItems!.map((item) => {
      const pack = packs.find((p: any) => p._id.toString() === item.packId);
      if (!pack) {
        throw createError(400, `Catering pack ${item.packId} not found`);
      }
      // Validate minimum people count
      if (item.peopleCount < pack.minPeople) {
        throw createError(400, `${pack.name} requires at least ${pack.minPeople} people`);
      }
      return {
        packId: (pack as any)._id,
        name: pack.name,
        pricePerPerson: pack.pricePerPerson,
        peopleCount: item.peopleCount,
        quantity: item.quantity,
      };
    });

    cateringSubtotal = cateringOrderItems.reduce(
      (sum, item) => sum + item.pricePerPerson * item.peopleCount * item.quantity,
      0
    );
  }

  // Process offer items if present
  if (hasOfferItems) {
    const offerIds = payload.offerItems!.map((item) => item.offerId);
    const now = new Date();
    const offers = await OfferModel.find({
      _id: { $in: offerIds },
      isActive: true,
      $or: [
        { validFrom: { $exists: false }, validUntil: { $exists: false } },
        { validFrom: { $lte: now }, validUntil: { $exists: false } },
        { validFrom: { $exists: false }, validUntil: { $gte: now } },
        { validFrom: { $lte: now }, validUntil: { $gte: now } },
      ],
    }).lean();

    // Validate all offers exist and are active/valid
    if (offers.length !== offerIds.length) {
      throw createError(400, 'Some offers are not available');
    }

    // Build offer order items with current prices
    offerOrderItems = payload.offerItems!.map((item) => {
      const offer = offers.find((o: any) => o._id.toString() === item.offerId);
      if (!offer) {
        throw createError(400, `Offer ${item.offerId} not found`);
      }
      return {
        offerId: (offer as any)._id,
        name: offer.name,
        price: offer.price,
        quantity: item.quantity,
      };
    });

    offerSubtotal = offerOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // Calculate totals
  const subtotal = menuSubtotal + cateringSubtotal + offerSubtotal;

  // Fetch restaurant settings for minimum order and delivery charge
  const settings = await RestaurantSettingsService.get();

  // Enforce minimum order amount (applies to both delivery and pickup)
  if (settings.minimumOrderAmount > 0 && subtotal < settings.minimumOrderAmount) {
    throw createError(400, `Minimum order amount is €${settings.minimumOrderAmount.toFixed(2)}`);
  }

  // Apply discount based on order type (pickup/delivery)
  const orderType = payload.isPickup ? 'pickup' : 'delivery';
  const discountResult = await DiscountService.calculateDiscount(orderType, subtotal);

  // Add delivery charge for delivery orders
  const deliveryCharge = (!payload.isPickup && settings.deliveryCharge > 0) ? settings.deliveryCharge : 0;
  const total = discountResult.finalAmount + deliveryCharge;

  // Create metadata to store in Mollie payment
  const metadata: OrderMetadata = {
    userId,
    email: payload.email,
    items: orderItems,
    cateringItems: cateringOrderItems.length > 0 ? cateringOrderItems : undefined,
    offerItems: offerOrderItems.length > 0 ? offerOrderItems : undefined,
    subtotal,
    total,
    deliveryCharge,
    isPickup: payload.isPickup,
    pickupTime: payload.pickupTime,
    notes: payload.notes,
    deliveryAddress: payload.deliveryAddress,
    contactMobile: payload.contactMobile,
  };

  // Create Mollie payment
  // Note: We'll update the redirect URL after getting the payment ID
  const payment = await getMollieClient().payments.create({
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
  await getMollieClient().payments.update(payment.id, {
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
  const payment = await getMollieClient().payments.get(paymentId);

  // Parse metadata to check order type
  if (payment.metadata) {
    const metadata = JSON.parse(payment.metadata as string);
    
    // If this is a catering order, handle it separately
    if (metadata.type === 'catering') {
      await handleCateringWebhook(paymentId, metadata as CateringOrderMetadata);
      return;
    }
  }

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
    email: metadata.email,
    items: metadata.items,
    cateringItems: metadata.cateringItems || [],
    offerItems: metadata.offerItems || [],
    subtotal: metadata.subtotal,
    total: metadata.total,
    deliveryCharge: metadata.deliveryCharge || 0,
    status: 'confirmed', // Order is confirmed upon successful payment
    pickupTime: metadata.pickupTime ? new Date(metadata.pickupTime) : undefined,
    notes: metadata.notes,
    deliveryAddress: metadata.deliveryAddress,
    contactMobile: metadata.contactMobile,
    paymentId: payment.id,
    paymentStatus: 'paid',
    paymentMethod: payment.method?.toString() || 'mollie',
  });

  await order.save();

  // Build email items list including menu items, catering packs, and offers
  const emailItems = [
    ...metadata.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    ...(metadata.cateringItems || []).map(item => ({
      name: `${item.name} (${item.peopleCount} people)`,
      quantity: item.quantity,
      price: item.pricePerPerson * item.peopleCount,
    })),
    ...(metadata.offerItems || []).map(item => ({
      name: `${item.name} (Special Offer)`,
      quantity: item.quantity,
      price: item.price,
    })),
  ];

  // Send order confirmation email to customer
  EmailService.sendOrderConfirmationEmail({
    email: metadata.email,
    orderNumber,
    items: emailItems,
    total: metadata.total,
    deliveryAddress: metadata.deliveryAddress,
    contactMobile: metadata.contactMobile,
    notes: metadata.notes,
    isPickup: metadata.isPickup,
    pickupTime: metadata.pickupTime,
  });

  // Send order notification to admin
  EmailService.sendOrderAdminNotification({
    email: metadata.email,
    orderNumber,
    items: emailItems,
    total: metadata.total,
    deliveryAddress: metadata.deliveryAddress,
    contactMobile: metadata.contactMobile,
    notes: metadata.notes,
    createdAt: new Date().toLocaleString(),
    isPickup: metadata.isPickup,
    pickupTime: metadata.pickupTime,
  });
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
        orderId: String(order._id),
      },
    };
  }

  // If no order yet, check Mollie directly
  const payment = await getMollieClient().payments.get(paymentId);

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
      email: metadata.email,
      items: metadata.items,
      cateringItems: metadata.cateringItems || [],
      offerItems: metadata.offerItems || [],
      subtotal: metadata.subtotal,
      total: metadata.total,
      deliveryCharge: metadata.deliveryCharge || 0,
      status: 'confirmed',
      pickupTime: metadata.pickupTime ? new Date(metadata.pickupTime) : undefined,
      notes: metadata.notes,
      deliveryAddress: metadata.deliveryAddress,
      contactMobile: metadata.contactMobile,
      paymentId: payment.id,
      paymentStatus: 'paid',
      paymentMethod: payment.method?.toString() || 'mollie',
    });

    await order.save();

    // Build email items list including menu items, catering packs, and offers
    const emailItems = [
      ...metadata.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      ...(metadata.cateringItems || []).map(item => ({
        name: `${item.name} (${item.peopleCount} people)`,
        quantity: item.quantity,
        price: item.pricePerPerson * item.peopleCount,
      })),
      ...(metadata.offerItems || []).map(item => ({
        name: `${item.name} (Special Offer)`,
        quantity: item.quantity,
        price: item.price,
      })),
    ];

    // Send emails for this order too
    EmailService.sendOrderConfirmationEmail({
      email: metadata.email,
      orderNumber,
      items: emailItems,
      total: metadata.total,
      deliveryAddress: metadata.deliveryAddress,
      contactMobile: metadata.contactMobile,
      notes: metadata.notes,
    });

    EmailService.sendOrderAdminNotification({
      email: metadata.email,
      orderNumber,
      items: emailItems,
      total: metadata.total,
      deliveryAddress: metadata.deliveryAddress,
      contactMobile: metadata.contactMobile,
      notes: metadata.notes,
      createdAt: new Date().toLocaleString(),
    });

    return {
      status: 'paid',
      isPaid: true,
      order: {
        orderNumber: order.orderNumber,
        orderId: String(order._id),
      },
    };
  }

  return {
    status: payment.status,
    isPaid: payment.status === 'paid',
  };
};

// ============ CATERING PAYMENT FUNCTIONS ============

// Interface for catering payment initiation payload
interface InitiateCateringPaymentPayload {
  cateringPackId: string;
  peopleCount: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: {
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    additionalInfo?: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

// Interface for catering order metadata stored in Mollie payment
interface CateringOrderMetadata {
  type: 'catering'; // Flag to identify catering orders
  cateringPackId: string;
  packName: string;
  category: string;
  pricePerPerson: number;
  menuItemNames: string[];
  peopleCount: number;
  totalPrice: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: {
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    additionalInfo?: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

/**
 * Create a Mollie payment session for catering order
 * Stores order data in payment metadata - order is only created after successful payment
 */
const initiateCateringPayment = async ({
  payload,
}: {
  payload: InitiateCateringPaymentPayload;
}): Promise<{ paymentUrl: string; paymentId: string }> => {
  // Get the catering pack with menu items
  const pack = await CateringPackModel.findById(payload.cateringPackId).populate({
    path: 'menuItems',
    select: 'name',
  });

  if (!pack) {
    throw createError(404, 'Catering pack not found');
  }

  if (!pack.isActive) {
    throw createError(400, 'This catering pack is no longer available');
  }

  // Validate people count
  if (payload.peopleCount < pack.minPeople) {
    throw createError(400, `Minimum number of people required is ${pack.minPeople}`);
  }

  // Validate delivery date is not in the past
  const deliveryDate = new Date(payload.deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (deliveryDate < today) {
    throw createError(400, 'Delivery date cannot be in the past');
  }

  // Calculate total price
  const totalPrice = payload.peopleCount * pack.pricePerPerson;

  // Get menu item names
  const menuItemNames = (pack.menuItems as any[]).map((item: any) => item.name);

  // Create metadata to store in Mollie payment
  const metadata: CateringOrderMetadata = {
    type: 'catering',
    cateringPackId: payload.cateringPackId,
    packName: pack.name,
    category: pack.category,
    pricePerPerson: pack.pricePerPerson,
    menuItemNames,
    peopleCount: payload.peopleCount,
    totalPrice,
    deliveryDate: payload.deliveryDate,
    deliveryTime: payload.deliveryTime,
    deliveryAddress: payload.deliveryAddress,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    notes: payload.notes,
  };

  // Create Mollie payment
  const payment = await getMollieClient().payments.create({
    amount: {
      currency: 'EUR',
      value: totalPrice.toFixed(2),
    },
    description: `Light of India - Catering Order (${pack.name}, ${payload.peopleCount} people)`,
    redirectUrl: `${MOLLIE_CONFIG.redirectUrl}/catering/success`,
    webhookUrl: MOLLIE_CONFIG.webhookUrl,
    metadata: JSON.stringify(metadata),
    method: [PaymentMethod.ideal, PaymentMethod.creditcard, PaymentMethod.bancontact, PaymentMethod.eps],
  });

  if (!payment._links.checkout?.href) {
    throw createError(500, 'Failed to create payment session');
  }

  // Update the payment with the correct redirect URL including the payment ID
  await getMollieClient().payments.update(payment.id, {
    redirectUrl: `${MOLLIE_CONFIG.redirectUrl}/catering/success?paymentId=${payment.id}`,
  });

  return {
    paymentUrl: payment._links.checkout.href,
    paymentId: payment.id,
  };
};

/**
 * Handle Mollie webhook callback for catering orders
 * Creates the catering order after successful payment
 */
const handleCateringWebhook = async (paymentId: string, metadata: CateringOrderMetadata): Promise<void> => {
  // Get payment details from Mollie
  const payment = await getMollieClient().payments.get(paymentId);

  // Check if order already exists for this payment (idempotency)
  const existingOrder = await CateringOrderModel.findOne({ paymentId });
  if (existingOrder) {
    // Update payment status if it has changed
    if (payment.status === 'paid' && existingOrder.paymentStatus !== 'paid') {
      existingOrder.paymentStatus = 'paid';
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

  // Get the catering pack with full menu items for email
  const pack = await CateringPackModel.findById(metadata.cateringPackId).populate({
    path: 'menuItems',
    select: 'name description descriptionNl price isVegetarian isSpicy',
  });

  if (!pack) {
    console.error(`Catering pack ${metadata.cateringPackId} not found during webhook processing`);
    return;
  }

  // Create the catering order
  const order = new CateringOrderModel({
    cateringPack: metadata.cateringPackId,
    peopleCount: metadata.peopleCount,
    totalPrice: metadata.totalPrice,
    deliveryDate: new Date(metadata.deliveryDate),
    deliveryTime: metadata.deliveryTime,
    deliveryAddress: metadata.deliveryAddress,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    customerPhone: metadata.customerPhone,
    notes: metadata.notes,
    paymentId: payment.id,
    paymentStatus: 'paid',
    deliveryStatus: 'yet_to_be_delivered',
  });

  await order.save();

  // Format category display
  const categoryDisplay = metadata.category === 'vegetarian' 
    ? 'Vegetarian' 
    : metadata.category === 'non-vegetarian' 
    ? 'Non-Vegetarian' 
    : 'Mixed';

  // Format date for display
  const deliveryDateFormatted = new Date(metadata.deliveryDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Prepare email data
  const emailData = {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    packName: metadata.packName,
    category: metadata.category,
    categoryDisplay,
    menuItems: (pack.menuItems as any[]).map((item: any) => ({ name: item.name })),
    peopleCount: metadata.peopleCount,
    pricePerPerson: metadata.pricePerPerson.toFixed(2),
    totalPrice: metadata.totalPrice.toFixed(2),
    deliveryDate: deliveryDateFormatted,
    deliveryTime: metadata.deliveryTime,
    deliveryAddress: metadata.deliveryAddress,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    customerPhone: metadata.customerPhone,
    notes: metadata.notes,
  };

  // Send order confirmation email to customer
  EmailService.sendCateringOrderConfirmation(emailData);

  // Send order notification to admin
  EmailService.sendCateringOrderAdminNotification({
    ...emailData,
    orderDate: new Date().toLocaleString('en-GB'),
  });
};

/**
 * Get catering payment status
 * Also creates order if payment is successful but order doesn't exist (fallback for webhook delays)
 */
const getCateringPaymentStatus = async (
  paymentId: string,
): Promise<{
  status: string;
  isPaid: boolean;
  order?: {
    orderNumber: string;
    orderId: string;
  };
}> => {
  // First check if we have a catering order with this payment ID
  let order = await CateringOrderModel.findOne({ paymentId });

  if (order) {
    return {
      status: order.paymentStatus,
      isPaid: order.paymentStatus === 'paid',
      order: {
        orderNumber: order.orderNumber,
        orderId: String(order._id),
      },
    };
  }

  // If no order yet, check Mollie directly
  const payment = await getMollieClient().payments.get(paymentId);

  // If payment is successful but no order exists, create it now (fallback for webhook delays)
  if (payment.status === 'paid' && payment.metadata) {
    const metadata: CateringOrderMetadata = JSON.parse(payment.metadata as string);
    
    // Verify this is a catering order
    if (metadata.type !== 'catering') {
      return {
        status: payment.status,
        isPaid: false,
      };
    }

    // Process the catering webhook
    await handleCateringWebhook(paymentId, metadata);

    // Fetch the created order
    order = await CateringOrderModel.findOne({ paymentId });
    if (order) {
      return {
        status: 'paid',
        isPaid: true,
        order: {
          orderNumber: order.orderNumber,
          orderId: String(order._id),
        },
      };
    }
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
  // Catering payment functions
  initiateCateringPayment,
  getCateringPaymentStatus,
};

export default PaymentService;
