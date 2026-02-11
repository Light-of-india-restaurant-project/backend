import { z } from 'zod';

import { ORDER_STATUS } from '../models/order/order.model';

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  pickupTime: z.string().datetime().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS, {
    errorMap: () => ({ message: `Status must be one of: ${ORDER_STATUS.join(', ')}` }),
  }),
});

const OrderValidator = {
  createOrderSchema,
  updateOrderStatusSchema,
};

export default OrderValidator;
