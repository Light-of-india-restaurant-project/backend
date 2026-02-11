/* eslint-disable @typescript-eslint/no-explicit-any */

import { DynamicMessages } from '../../constant/error';
import { MenuItemModel } from '../../models/menu/menu.model';
import OrderRepository from '../../repositories/order/order.repository';
import createError from '../../utils/http.error';

import type { IOrder, IOrderItem, OrderStatus } from '../../models/order/order.model';
import type { RepositoryOptions } from '../../repositories/repository.types';

interface CreateOrderPayload {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  pickupTime?: string;
  notes?: string;
}

interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | OrderStatus[];
  startDate?: string;
  endDate?: string;
}

// Create a new order
const createOrder = async ({
  userId,
  payload,
  options,
}: {
  userId: string;
  payload: CreateOrderPayload;
  options?: RepositoryOptions;
}): Promise<IOrder> => {
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

  // Generate order number
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  const orderNumber = `ORD-${dateStr}-${random}`;

  const orderData: Partial<IOrder> = {
    orderNumber,
    userId: userId as any,
    items: orderItems,
    subtotal,
    total,
    status: 'pending',
    notes: payload.notes,
  };

  if (payload.pickupTime) {
    orderData.pickupTime = new Date(payload.pickupTime);
  }

  const order = await OrderRepository.createOrder({ data: orderData, options });
  return order;
};

// Get user's orders
const getUserOrders = async ({
  userId,
  params,
}: {
  userId: string;
  params?: OrderQueryParams;
}): Promise<{ orders: IOrder[]; total: number; page: number; limit: number }> => {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const options: any = {
    userId,
    skip,
    limit,
  };

  if (params?.status) {
    options.status = params.status;
  }

  const [orders, total] = await Promise.all([
    OrderRepository.getOrdersByUserId({ userId, options: { skip, limit } }),
    OrderRepository.countOrders({ options: { userId } }),
  ]);

  return { orders, total, page, limit };
};

// Get single order (for user)
const getUserOrderById = async ({ userId, orderId }: { userId: string; orderId: string }): Promise<IOrder> => {
  const order = await OrderRepository.getOrderById({ id: orderId });

  if (!order) {
    throw createError(404, DynamicMessages.notFoundMessage('Order'));
  }

  // Ensure user owns the order
  if (order.userId.toString() !== userId) {
    throw createError(403, 'You are not authorized to view this order');
  }

  return order;
};

// Cancel order (user can only cancel pending orders)
const cancelOrder = async ({ userId, orderId }: { userId: string; orderId: string }): Promise<IOrder> => {
  const order = await OrderRepository.getOrderById({ id: orderId });

  if (!order) {
    throw createError(404, DynamicMessages.notFoundMessage('Order'));
  }

  if (order.userId.toString() !== userId) {
    throw createError(403, 'You are not authorized to cancel this order');
  }

  if (order.status !== 'pending') {
    throw createError(400, 'Only pending orders can be cancelled');
  }

  const updatedOrder = await OrderRepository.updateOrder({
    id: orderId,
    data: { status: 'cancelled' },
  });

  return updatedOrder!;
};

// ==================== Admin Functions ====================

// Get all orders (admin)
const getAllOrders = async ({
  params,
}: {
  params?: OrderQueryParams;
}): Promise<{ orders: IOrder[]; total: number; page: number; limit: number; totalPages: number }> => {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const options: any = {
    skip,
    limit,
    populate: { path: 'userId', select: 'email mobile' },
  };

  if (params?.status) {
    options.status = params.status;
  }

  if (params?.startDate) {
    options.startDate = new Date(params.startDate);
  }

  if (params?.endDate) {
    options.endDate = new Date(params.endDate);
  }

  const [orders, total] = await Promise.all([OrderRepository.getAllOrders({ options }), OrderRepository.countOrders({ options })]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Get order by ID (admin)
const getOrderById = async ({ orderId }: { orderId: string }): Promise<IOrder> => {
  const order = await OrderRepository.getOrderById({
    id: orderId,
    options: { populate: { path: 'userId', select: 'email mobile' } },
  });

  if (!order) {
    throw createError(404, DynamicMessages.notFoundMessage('Order'));
  }

  return order;
};

// Update order status (admin)
const updateOrderStatus = async ({ orderId, status }: { orderId: string; status: OrderStatus }): Promise<IOrder> => {
  const order = await OrderRepository.getOrderById({ id: orderId });

  if (!order) {
    throw createError(404, DynamicMessages.notFoundMessage('Order'));
  }

  // Validate status transition
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    throw createError(400, `Cannot change order status from ${order.status} to ${status}`);
  }

  const updatedOrder = await OrderRepository.updateOrder({
    id: orderId,
    data: { status },
  });

  return updatedOrder!;
};

const OrderService = {
  createOrder,
  getUserOrders,
  getUserOrderById,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

export default OrderService;
