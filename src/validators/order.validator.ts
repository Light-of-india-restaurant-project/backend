import { z } from 'zod';

import { ORDER_STATUS } from '../models/order/order.model';

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const cateringItemSchema = z.object({
  packId: z.string().min(1, 'Catering pack ID is required'),
  peopleCount: z.number().int().min(1, 'People count must be at least 1'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const offerItemSchema = z.object({
  offerId: z.string().min(1, 'Offer ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Dutch postal code format: 4 digits + 2 letters (e.g., 3011 AB)
const dutchPostalCodePattern = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

// Dutch mobile number pattern - accepts 0 format only (e.g., 0612345678)
const dutchMobilePattern = /^0[0-9]{9}$/;

// Delivery address validation schema
// Note: Actual delivery zone validation is done in the service layer (async DB check)
const deliveryAddressSchema = z.object({
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .refine(
      (val) => dutchPostalCodePattern.test(val.replace(/\s/g, '')),
      'Invalid postal code format. Please enter a valid Dutch postal code (e.g., 3011 AB).'
    ),
  streetName: z.string().min(1, 'Street name is required').max(100, 'Street name too long'),
  houseNumber: z.string().min(1, 'House number is required').max(20, 'House number too long'),
  city: z.string().min(1, 'City is required').max(50, 'City name too long').default('Rotterdam'),
});

// Dutch mobile number validation
const dutchMobileSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .refine(
    (val) => {
      const cleanMobile = val.replace(/[\s-]/g, '');
      return dutchMobilePattern.test(cleanMobile);
    },
    'Invalid mobile number. Please use Dutch format starting with 0 (e.g., 0612345678)'
  );

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).optional(),
  cateringItems: z.array(cateringItemSchema).optional(),
  offerItems: z.array(offerItemSchema).optional(),
  isPickup: z.boolean().optional(),
  pickupTime: z.string().datetime().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  deliveryAddress: deliveryAddressSchema.optional(),
  contactMobile: dutchMobileSchema,
  email: z.string().email('Invalid email address'),
}).refine(
  (data) => {
    const hasItems = data.items && data.items.length > 0;
    const hasCateringItems = data.cateringItems && data.cateringItems.length > 0;
    const hasOfferItems = data.offerItems && data.offerItems.length > 0;
    return hasItems || hasCateringItems || hasOfferItems;
  },
  { message: 'Order must have at least one menu item, catering pack, or offer' }
).refine(
  (data) => {
    // Delivery address is required for delivery orders
    if (!data.isPickup) {
      return !!data.deliveryAddress;
    }
    return true;
  },
  { message: 'Delivery address is required for delivery orders', path: ['deliveryAddress'] }
);
// Note: pickupTime is optional for pickup orders - "As soon as possible" is allowed

const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS, {
    errorMap: () => ({ message: `Status must be one of: ${ORDER_STATUS.join(', ')}` }),
  }),
});

// Schema for checking if postal code is in delivery area
const checkPostalCodeSchema = z.object({
  postalCode: z.string().min(1, 'Postal code is required'),
});

const OrderValidator = {
  createOrderSchema,
  updateOrderStatusSchema,
  checkPostalCodeSchema,
  deliveryAddressSchema,
};

export default OrderValidator;
