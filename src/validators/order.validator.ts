import { z } from 'zod';

import { ORDER_STATUS } from '../models/order/order.model';

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Dutch postal code format: 4 digits + 2 letters (e.g., 3011 AB)
const dutchPostalCodePattern = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

// Dutch mobile number pattern
const dutchMobilePattern = /^(\+31[0-9]{9}|06[0-9]{8}|0031[0-9]{9})$/;

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
    'Invalid mobile number. Please use Dutch format (e.g., 06xxxxxxxx or +316xxxxxxxx)'
  );

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  pickupTime: z.string().datetime().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  deliveryAddress: deliveryAddressSchema,
  contactMobile: dutchMobileSchema,
  email: z.string().email('Invalid email address'),
});

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
