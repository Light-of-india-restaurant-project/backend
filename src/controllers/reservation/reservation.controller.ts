import { DynamicMessages } from '../../constant/error';
import { ReservationService } from '../../services/reservation/reservation.service';

import type { Request, Response, NextFunction } from 'express';
import type { ReservationStatus } from '../../models/reservation/reservation.model';

// ==================== Public Endpoints ====================

// Get available time slots for a date
const getAvailableSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date, guests } = req.query;

    const slots = await ReservationService.getAvailableSlots({
      date: new Date(date as string),
      guests: parseInt(guests as string, 10),
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Available slots'),
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new reservation (public)
const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if user is authenticated (optional)
    const userId = (req as Request & { user?: { _id: string } }).user?._id;

    const reservation = await ReservationService.create({
      payload: {
        ...req.body,
        userId,
      },
    });

    res.status(201).json({
      message: DynamicMessages.createMessage('Reservation'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservation by confirmation code (public)
const getByConfirmationCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await ReservationService.getByConfirmationCode({
      confirmationCode: req.params.confirmationCode,
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Reservation'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel reservation (public - by confirmation code)
const cancelByConfirmationCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First get the reservation to get its ID
    const existing = await ReservationService.getByConfirmationCode({
      confirmationCode: req.params.confirmationCode,
    });

    const reservation = await ReservationService.cancel({
      id: (existing as unknown as { _id: string })._id.toString(),
    });

    res.status(200).json({
      message: 'Reservation cancelled successfully',
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== User Endpoints ====================

// Get user's reservations
const getMyReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as Request & { user: { _id: string } }).user._id;
    const { page, limit } = req.query;

    const result = await ReservationService.getByUserId({
      userId,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Reservations'),
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== Admin Endpoints ====================

// Get paginated reservations
const getPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, date, page, limit } = req.query;

    const result = await ReservationService.getPaginated({
      params: {
        search: search as string,
        status: status as ReservationStatus,
        date: date ? new Date(date as string) : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      },
    });

    res.status(200).json({
      message: DynamicMessages.fetched('Reservations'),
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Get reservation by ID (admin)
const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await ReservationService.getById({ id: req.params.id });

    res.status(200).json({
      message: DynamicMessages.fetched('Reservation'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Update reservation (admin)
const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await ReservationService.update({
      id: req.params.id,
      payload: req.body,
    });

    res.status(200).json({
      message: DynamicMessages.updateMessage('Reservation'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Update reservation status (admin)
const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await ReservationService.updateStatus({
      id: req.params.id,
      status: req.body.status,
    });

    res.status(200).json({
      message: DynamicMessages.updateMessage('Reservation status'),
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm reservation (admin)
const confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await ReservationService.confirm({ id: req.params.id });

    res.status(200).json({
      message: 'Reservation confirmed successfully',
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
    const reservation = await ReservationService.cancel({ id: req.params.id });

    res.status(200).json({
      message: 'Reservation cancelled successfully',
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Mark as completed (admin)
const complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await ReservationService.complete({ id: req.params.id });

    res.status(200).json({
      message: 'Reservation marked as completed',
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// Mark as no-show (admin)
const markNoShow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reservation = await ReservationService.markNoShow({ id: req.params.id });

    res.status(200).json({
      message: 'Reservation marked as no-show',
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
    await ReservationService.remove({ id: req.params.id });

    res.status(200).json({
      message: DynamicMessages.deleteMessage('Reservation'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const ReservationController = {
  // Public
  getAvailableSlots,
  create,
  getByConfirmationCode,
  cancelByConfirmationCode,
  // User
  getMyReservations,
  // Admin
  getPaginated,
  getById,
  update,
  updateStatus,
  confirm,
  cancel,
  complete,
  markNoShow,
  remove,
};
