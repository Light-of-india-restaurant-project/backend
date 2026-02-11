import { DynamicMessages } from '../../constant/error';
import OrderService from '../../services/order/order.service';

import type { CustomRequest } from '../../interfaces/auth.interface';
import type { Response, NextFunction } from 'express';

// Create a new order
const createOrder = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await OrderService.createOrder({
      userId: req.user,
      payload: req.body,
    });
    res.status(201).json({
      message: DynamicMessages.createMessage('Order'),
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's orders
const getUserOrders = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, status } = req.query;
    const result = await OrderService.getUserOrders({
      userId: req.user,
      params: {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as any,
      },
    });
    res.status(200).json({
      message: DynamicMessages.fetched('Orders'),
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Get single order
const getOrderById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await OrderService.getUserOrderById({
      userId: req.user,
      orderId: req.params.id,
    });
    res.status(200).json({
      message: DynamicMessages.fetched('Order'),
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
const cancelOrder = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await OrderService.cancelOrder({
      userId: req.user,
      orderId: req.params.id,
    });
    res.status(200).json({
      message: 'Order cancelled successfully',
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

const OrderController = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
};

export default OrderController;
