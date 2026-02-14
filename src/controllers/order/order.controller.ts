import { DynamicMessages } from '../../constant/error';
import DeliveryZoneService from '../../services/delivery/delivery-zone.service';
import OrderService from '../../services/order/order.service';

import type { CustomRequest } from '../../interfaces/auth.interface';
import type { Response, NextFunction, Request } from 'express';

// Check if postal code is in delivery area (public endpoint)
const checkDeliveryArea = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { postalCode } = req.params;
    
    if (!postalCode) {
      res.status(400).json({
        success: false,
        deliverable: false,
        message: 'Postal code is required',
      });
      return;
    }

    const result = await DeliveryZoneService.checkPostalCodeDeliverable(postalCode);
    
    // Format postal code for response
    const cleanCode = postalCode.replace(/\s/g, '').toUpperCase();
    const formattedPostalCode = cleanCode.length === 6 
      ? `${cleanCode.substring(0, 4)} ${cleanCode.substring(4)}` 
      : postalCode;

    res.status(200).json({
      success: true,
      deliverable: result.deliverable,
      postalCode: formattedPostalCode,
      zoneName: result.zone?.name,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

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
  checkDeliveryArea,
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
};

export default OrderController;
