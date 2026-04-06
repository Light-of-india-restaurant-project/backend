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
    const orderId = req.params.id as string;
    const order = await OrderService.getOrderById({
      orderId,
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
    const orderId = req.params.id as string;
    const order = await OrderService.updateOrderStatus({
      orderId,
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

// Mark order as visited
const markOrderAsVisited = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    await OrderService.markOrderAsVisited({ orderId });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Order visited status'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Get unvisited order count
const getUnvisitedCount = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await OrderService.getUnvisitedOrderCount();
    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

const AdminOrderController = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  markOrderAsVisited,
  getUnvisitedCount,
};

export default AdminOrderController;
