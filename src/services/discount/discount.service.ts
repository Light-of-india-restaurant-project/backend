import { DiscountModel } from '../../models/discount/discount.model';
import createError from '../../utils/http.error';

import type { IDiscount } from '../../models/discount/discount.model';

interface UpdateDiscountPayload {
  percentage?: number;
  isActive?: boolean;
  description?: string;
}

/**
 * Get all discounts
 */
const getAllDiscounts = async (): Promise<IDiscount[]> => {
  return DiscountModel.find().sort({ type: 1 });
};

/**
 * Get active discounts (for frontend)
 */
const getActiveDiscounts = async (): Promise<IDiscount[]> => {
  return DiscountModel.find({ isActive: true });
};

/**
 * Get discount by type
 */
const getDiscountByType = async (type: 'delivery' | 'pickup'): Promise<IDiscount | null> => {
  return DiscountModel.findOne({ type });
};

/**
 * Create or update discount by type
 */
const upsertDiscount = async (type: 'delivery' | 'pickup', payload: UpdateDiscountPayload): Promise<IDiscount> => {
  const discount = await DiscountModel.findOneAndUpdate(
    { type },
    { 
      type,
      ...payload 
    },
    { new: true, upsert: true }
  );
  return discount;
};

/**
 * Update discount
 */
const updateDiscount = async (id: string, payload: UpdateDiscountPayload): Promise<IDiscount> => {
  const discount = await DiscountModel.findById(id);
  if (!discount) {
    throw createError(404, 'Discount not found');
  }

  Object.assign(discount, payload);
  await discount.save();
  return discount;
};

/**
 * Toggle discount active status
 */
const toggleDiscountStatus = async (id: string): Promise<IDiscount> => {
  const discount = await DiscountModel.findById(id);
  if (!discount) {
    throw createError(404, 'Discount not found');
  }
  discount.isActive = !discount.isActive;
  await discount.save();
  return discount;
};

/**
 * Calculate discount amount
 */
const calculateDiscount = async (orderType: 'delivery' | 'pickup', totalAmount: number): Promise<{ discountAmount: number; discountPercentage: number; finalAmount: number }> => {
  const discount = await DiscountModel.findOne({ type: orderType, isActive: true });
  
  if (!discount || discount.percentage <= 0) {
    return {
      discountAmount: 0,
      discountPercentage: 0,
      finalAmount: totalAmount,
    };
  }

  const discountAmount = (totalAmount * discount.percentage) / 100;
  const finalAmount = totalAmount - discountAmount;

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercentage: discount.percentage,
    finalAmount: Math.round(finalAmount * 100) / 100,
  };
};

/**
 * Initialize default discounts if not exist
 */
const initializeDefaults = async (): Promise<void> => {
  const deliveryDiscount = await DiscountModel.findOne({ type: 'delivery' });
  if (!deliveryDiscount) {
    await DiscountModel.create({ type: 'delivery', percentage: 0, isActive: false });
  }

  const pickupDiscount = await DiscountModel.findOne({ type: 'pickup' });
  if (!pickupDiscount) {
    await DiscountModel.create({ type: 'pickup', percentage: 0, isActive: false });
  }
};

const DiscountService = {
  getAllDiscounts,
  getActiveDiscounts,
  getDiscountByType,
  upsertDiscount,
  updateDiscount,
  toggleDiscountStatus,
  calculateDiscount,
  initializeDefaults,
};

export default DiscountService;
