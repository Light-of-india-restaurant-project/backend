import { DynamicMessages } from '../../constant/error';
import OrderService from '../../services/order/order.service';

import type { Request, Response, NextFunction } from 'express';

// Get all orders
const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, status, startDate, endDate } = req.query;
    const result = await OrderService.getAllOrders({
      params: {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as any,
        startDate: startDate as string,
        endDate: endDate as string,
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

// Get order by ID
const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await OrderService.getOrderById({
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

// Update order status
const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await OrderService.updateOrderStatus({
      orderId: req.params.id,
      status: req.body.status,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Order status'),
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

const AdminOrderController = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

export default AdminOrderController;
