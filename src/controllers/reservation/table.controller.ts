import { DynamicMessages } from '../../constant/error';
import { TableService } from '../../services/reservation/table.service';

import type { Request, Response, NextFunction } from 'express';

// Create table
const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const table = await TableService.create({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('Table'),
      success: true,
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

// Update table
const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const table = await TableService.update({
      id: req.params.id,
      payload: req.body,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Table'),
      success: true,
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

// Delete table
const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await TableService.remove({ id: req.params.id });
    res.status(200).json({
      message: DynamicMessages.deleteMessage('Table'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Get table by ID
const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const table = await TableService.getById({ id: req.params.id });
    res.status(200).json({
      message: DynamicMessages.fetched('Table'),
      success: true,
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

// Get all tables (active only for public)
const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tables = await TableService.getAll({ isActive: true });
    res.status(200).json({
      message: DynamicMessages.fetched('Tables'),
      success: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

// Get paginated tables (admin)
const getPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isActive, page, limit } = req.query;

    const result = await TableService.getPaginated({
      params: {
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      },
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Tables'),
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const TableController = {
  create,
  update,
  remove,
  getById,
  getAll,
  getPaginated,
};
