import DiscountService from '../../services/discount/discount.service';

import type { Request, Response, NextFunction } from 'express';

/**
 * Get all discounts (admin)
 */
const getAllDiscounts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const discounts = await DiscountService.getAllDiscounts();
    res.status(200).json({
      success: true,
      discounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active discounts (public - for frontend checkout)
 */
const getActiveDiscounts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const discounts = await DiscountService.getActiveDiscounts();
    res.status(200).json({
      success: true,
      discounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update discount by type (admin)
 */
const updateDiscountByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.params;
    if (type !== 'delivery' && type !== 'pickup') {
      res.status(400).json({
        success: false,
        message: 'Invalid discount type. Must be "delivery" or "pickup".',
      });
      return;
    }

    const discount = await DiscountService.upsertDiscount(type, req.body);
    res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} discount updated successfully`,
      discount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle discount status (admin)
 */
const toggleDiscountStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const discount = await DiscountService.toggleDiscountStatus(id);
    res.status(200).json({
      success: true,
      message: `Discount ${discount.isActive ? 'activated' : 'deactivated'} successfully`,
      discount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate discount for order (public - for frontend)
 */
const calculateDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderType, totalAmount } = req.body;
    
    if (orderType !== 'delivery' && orderType !== 'pickup') {
      res.status(400).json({
        success: false,
        message: 'Invalid order type. Must be "delivery" or "pickup".',
      });
      return;
    }

    if (typeof totalAmount !== 'number' || totalAmount < 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid total amount.',
      });
      return;
    }

    const result = await DiscountService.calculateDiscount(orderType, totalAmount);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const DiscountController = {
  getAllDiscounts,
  getActiveDiscounts,
  updateDiscountByType,
  toggleDiscountStatus,
  calculateDiscount,
};

export default DiscountController;
