import { DynamicMessages } from '../../constant/error';
import { BreakfastReservationService } from '../../services/reservation/breakfast-reservation.service';

import type { Request, Response, NextFunction } from 'express';
import type { BreakfastReservationStatus } from '../../models/reservation/breakfast-reservation.model';

const getOpenDates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dates = await BreakfastReservationService.getOpenDates();

    res.status(200).json({
      message: DynamicMessages.fetched('Open dates'),
      success: true,
      data: dates,
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await BreakfastReservationService.create(req.body);

    res.status(201).json({
      message: DynamicMessages.createMessage('Breakfast reservation'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

const getByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const email = req.query.email as string;
    const reservations = await BreakfastReservationService.getByEmail(email);

    res.status(200).json({
      message: DynamicMessages.fetched('Breakfast reservations'),
      success: true,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, startDate, endDate, skip, limit, sortBy } = req.query;

    const options: {
      status?: BreakfastReservationStatus | BreakfastReservationStatus[];
      startDate?: Date;
      endDate?: Date;
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {};

    if (status) {
      options.status = status as BreakfastReservationStatus;
    }
    if (startDate) {
      options.startDate = new Date(startDate as string);
    }
    if (endDate) {
      const end = new Date(endDate as string);
      end.setUTCHours(23, 59, 59, 999);
      options.endDate = end;
    }
    if (skip) {
      options.skip = parseInt(skip as string, 10);
    }
    if (limit) {
      options.limit = parseInt(limit as string, 10);
    }

    if (sortBy) {
      const [field, order] = (sortBy as string).split(':');
      const allowedFields = ['reservationDate', 'createdAt', 'name'];
      if (allowedFields.includes(field)) {
        options.sort = { [field]: order === 'asc' ? 1 : -1 };
      }
    }

    const result = await BreakfastReservationService.getAll(options);

    res.status(200).json({
      message: DynamicMessages.fetched('Breakfast reservations'),
      success: true,
      data: result.reservations,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const reservation = await BreakfastReservationService.getById(id);

    res.status(200).json({
      message: DynamicMessages.fetched('Breakfast reservation'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

const cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { cancellationReason, adminNote } = req.body;

    const reservation = await BreakfastReservationService.updateStatus(id, {
      status: 'cancelled',
      cancellationReason,
      adminNote,
    });

    res.status(200).json({
      message: 'Breakfast reservation cancelled',
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const BreakfastReservationController = {
  getOpenDates,
  create,
  getByEmail,
  getAll,
  getById,
  cancel,
};
