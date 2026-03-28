import { DynamicMessages } from '../../constant/error';
import { SimpleReservationService } from '../../services/reservation/simple-reservation.service';

import type { Request, Response, NextFunction } from 'express';
import type { SimpleReservationStatus } from '../../models/reservation/simple-reservation.model';

// ==================== Public Endpoints ====================

// Get available open dates
const getOpenDates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dates = await SimpleReservationService.getOpenDates();

    res.status(200).json({
      message: DynamicMessages.fetched('Open dates'),
      success: true,
      data: dates,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new simple reservation (public)
const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await SimpleReservationService.create(req.body);

    res.status(201).json({
      message: DynamicMessages.createMessage('Reservation'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations by email (public)
const getByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const email = req.query.email as string;
    const reservations = await SimpleReservationService.getByEmail(email);

    res.status(200).json({
      message: DynamicMessages.fetched('Reservations'),
      success: true,
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== Admin Endpoints ====================

// Get all reservations (admin)
const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, startDate, endDate, skip, limit, sortBy } = req.query;

    const options: {
      status?: SimpleReservationStatus | SimpleReservationStatus[];
      startDate?: Date;
      endDate?: Date;
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {};

    if (status) {
      options.status = status as SimpleReservationStatus;
    }
    if (startDate) {
      options.startDate = new Date(startDate as string);
    }
    if (endDate) {
      options.endDate = new Date(endDate as string);
    }
    if (skip) {
      options.skip = parseInt(skip as string, 10);
    }
    if (limit) {
      options.limit = parseInt(limit as string, 10);
    }

    // Parse sortBy param (e.g., "reservationDate:asc" or "createdAt:desc")
    if (sortBy) {
      const [field, order] = (sortBy as string).split(':');
      const allowedFields = ['reservationDate', 'createdAt', 'name'];
      if (allowedFields.includes(field)) {
        options.sort = { [field]: order === 'asc' ? 1 : -1 };
      }
    }

    const result = await SimpleReservationService.getAll(options);

    res.status(200).json({
      message: DynamicMessages.fetched('Reservations'),
      success: true,
      data: result.reservations,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservation by ID (admin)
const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const reservation = await SimpleReservationService.getById(id);

    res.status(200).json({
      message: DynamicMessages.fetched('Reservation'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Accept reservation (admin)
const accept = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { adminNote } = req.body;

    const reservation = await SimpleReservationService.updateStatus(id, {
      status: 'accepted',
      adminNote,
    });

    res.status(200).json({
      message: 'Reservation accepted successfully',
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Reject reservation (admin)
const reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { rejectionReason, adminNote } = req.body;

    const reservation = await SimpleReservationService.updateStatus(id, {
      status: 'rejected',
      rejectionReason,
      adminNote,
    });

    res.status(200).json({
      message: 'Reservation rejected',
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel reservation (admin)
const cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { cancellationReason, adminNote } = req.body;

    const reservation = await SimpleReservationService.updateStatus(id, {
      status: 'cancelled',
      cancellationReason,
      adminNote,
    });

    res.status(200).json({
      message: 'Reservation cancelled',
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Delete reservation (admin)
const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await SimpleReservationService.remove(id);

    res.status(200).json({
      message: DynamicMessages.deleteMessage('Reservation'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const SimpleReservationController = {
  getOpenDates,
  create,
  getByEmail,
  getAll,
  getById,
  accept,
  reject,
  cancel,
  remove,
};
