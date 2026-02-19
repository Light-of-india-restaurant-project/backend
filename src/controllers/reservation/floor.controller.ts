import { DynamicMessages } from '../../constant/error';
import { FloorService } from '../../services/reservation/floor.service';

import type { Request, Response, NextFunction } from 'express';

// Create floor
const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const floor = await FloorService.create({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('Floor'),
      success: true,
      data: floor,
    });
  } catch (error) {
    next(error);
  }
};

// Update floor
const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const floor = await FloorService.update({
      id: req.params.id,
      payload: req.body,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Floor'),
      success: true,
      data: floor,
    });
  } catch (error) {
    next(error);
  }
};

// Delete floor
const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await FloorService.remove({ id: req.params.id });
    res.status(200).json({
      message: DynamicMessages.deleteMessage('Floor'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Get floor by ID
const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const floor = await FloorService.getById({ id: req.params.id });
    res.status(200).json({
      message: DynamicMessages.fetched('Floor'),
      success: true,
      data: floor,
    });
  } catch (error) {
    next(error);
  }
};

// Get all floors (active only for public)
const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { locationType } = req.query;
    const floors = await FloorService.getAll({
      isActive: true,
      locationType: locationType as string,
    });
    res.status(200).json({
      message: DynamicMessages.fetched('Floors'),
      success: true,
      data: floors,
    });
  } catch (error) {
    next(error);
  }
};

// Get paginated floors (admin)
const getPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isActive, locationType, page, limit } = req.query;

    const result = await FloorService.getPaginated({
      params: {
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        locationType: locationType as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      },
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Floors'),
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const FloorController = {
  create,
  update,
  remove,
  getById,
  getAll,
  getPaginated,
};
