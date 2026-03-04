import { DynamicMessages } from '../../constant/error';
import CateringService from '../../services/catering/catering.service';
import CateringValidator from '../../validators/catering.validator';

import type { Request, Response, NextFunction } from 'express';

// ============ CATERING PACK CONTROLLERS ============

// Create a new catering pack (Admin)
const createPack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pack = await CateringService.createPack({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('Catering pack'),
      success: true,
      pack,
    });
  } catch (error) {
    next(error);
  }
};

// Update a catering pack (Admin)
const updatePack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const pack = await CateringService.updatePack({ id, payload: req.body });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Catering pack'),
      success: true,
      pack,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a catering pack (Admin)
const deletePack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await CateringService.deletePack({ id });
    res.status(200).json({
      message: DynamicMessages.deleteMessage('Catering pack'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single catering pack by ID
const getPackById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const pack = await CateringService.getPackById({ id });
    res.status(200).json({
      message: DynamicMessages.fetched('Catering pack'),
      success: true,
      pack,
    });
  } catch (error) {
    next(error);
  }
};

// Get all catering packs (Admin - paginated)
const getAllPacks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const queryParams = CateringValidator.queryParamsSchema.parse(req.query);
    const { page, limit, search, category, isActive } = queryParams;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await CateringService.getPacksPaginated({
      filter,
      options: {
        skip: (page - 1) * limit,
        limit,
      },
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Catering packs'),
      success: true,
      packs: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get active catering packs (Public)
const getActivePacks = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const packs = await CateringService.getActivePacks();
    res.status(200).json({
      message: DynamicMessages.fetched('Catering packs'),
      success: true,
      packs,
    });
  } catch (error) {
    next(error);
  }
};

// ============ CATERING ORDER CONTROLLERS ============

// Get all catering orders (Admin - paginated)
const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const queryParams = CateringValidator.queryParamsSchema.parse(req.query);
    const { page, limit, search, deliveryStatus, paymentStatus, startDate, endDate } = queryParams;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      filter.deliveryDate = {};
      if (startDate) (filter.deliveryDate as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (filter.deliveryDate as Record<string, Date>).$lte = new Date(endDate);
    }

    const result = await CateringService.getOrdersPaginated({
      filter,
      options: {
        skip: (page - 1) * limit,
        limit,
      },
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Catering orders'),
      success: true,
      orders: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single catering order by ID (Admin)
const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await CateringService.getOrderById({ id });
    res.status(200).json({
      message: DynamicMessages.fetched('Catering order'),
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Update delivery status (Admin)
const updateDeliveryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { deliveryStatus } = req.body;
    const order = await CateringService.updateDeliveryStatus({ id, status: deliveryStatus });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Delivery status'),
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

const CateringController = {
  // Pack controllers
  createPack,
  updatePack,
  deletePack,
  getPackById,
  getAllPacks,
  getActivePacks,
  // Order controllers
  getAllOrders,
  getOrderById,
  updateDeliveryStatus,
};

export default CateringController;
