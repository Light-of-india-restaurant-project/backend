import { DynamicMessages } from '../../constant/error';
import { RowService } from '../../services/reservation/row.service';

import type { Request, Response, NextFunction } from 'express';

// Create row
const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const row = await RowService.create({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('Row'),
      success: true,
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

// Update row
const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const row = await RowService.update({
      id: req.params.id,
      payload: req.body,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Row'),
      success: true,
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

// Delete row
const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await RowService.remove({ id: req.params.id });
    res.status(200).json({
      message: DynamicMessages.deleteMessage('Row'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Get row by ID
const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const row = await RowService.getById({ id: req.params.id });
    res.status(200).json({
      message: DynamicMessages.fetched('Row'),
      success: true,
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

// Get all rows (active only, optionally by floor)
const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { floor } = req.query;
    const rows = await RowService.getAll({
      isActive: true,
      floor: floor as string,
    });
    res.status(200).json({
      message: DynamicMessages.fetched('Rows'),
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// Get rows by floor
const getByFloor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rows = await RowService.getByFloor({ floorId: req.params.floorId });
    res.status(200).json({
      message: DynamicMessages.fetched('Rows'),
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// Get paginated rows (admin)
const getPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isActive, floor, page, limit } = req.query;

    const result = await RowService.getPaginated({
      params: {
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        floor: floor as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      },
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Rows'),
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const RowController = {
  create,
  update,
  remove,
  getById,
  getAll,
  getByFloor,
  getPaginated,
};
