import createError from 'http-errors';

import { BreakfastReservationRepository } from '../../repositories/reservation/breakfast-reservation.repository';
import { BreakfastSettingsRepository } from '../../repositories/reservation/breakfast-settings.repository';
import { resolveDateAvailability } from './date-availability.util';
import EmailService from '../email/email.service';
import logger from '../../utils/logger';

import type {
  IBreakfastReservation,
  BreakfastReservationStatus,
} from '../../models/reservation/breakfast-reservation.model';

interface CreateBreakfastReservationPayload {
  name: string;
  email: string;
  contactNumber: string;
  numberOfGuests: number;
  reservationDate: Date;
}

interface UpdateStatusPayload {
  status: BreakfastReservationStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  adminNote?: string;
}

const formatDateForEmail = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTimeForEmail = (date: Date): string => {
  return new Date(date).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getAvailableDates = async (): Promise<{ date: Date; isOpen: boolean; dayName: string; closureReason: string | null }[]> => {
  const settings = await BreakfastSettingsRepository.getOrCreate();
  const dates: { date: Date; isOpen: boolean; dayName: string; closureReason: string | null }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = 0; i < settings.maxAdvanceDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const availability = resolveDateAvailability(settings, date);

    dates.push({
      date,
      isOpen: availability.isOpen,
      dayName: availability.dayOfWeek,
      closureReason: availability.closureReason,
    });
  }

  return dates;
};

const getOpenDates = async (): Promise<{ date: Date; dayName: string; isOpen: boolean; closureReason: string | null }[]> => {
  const allDates = await getAvailableDates();
  return allDates.map(({ date, dayName, isOpen, closureReason }) => ({ date, dayName, isOpen, closureReason }));
};

const create = async (payload: CreateBreakfastReservationPayload): Promise<IBreakfastReservation> => {
  const reservationDate = new Date(payload.reservationDate);
  reservationDate.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (reservationDate < today) {
    throw createError(400, 'Breakfast reservation date cannot be in the past');
  }

  const settings = await BreakfastSettingsRepository.getOrCreate();
  const availability = resolveDateAvailability(settings, reservationDate);

  if (availability.isClosedByRestaurant) {
    throw createError(400, availability.closureReason || 'Restaurant is closed on this date');
  }

  if (availability.isClosedSpecifically) {
    throw createError(400, 'Restaurant is closed on this specific date');
  }

  if (!availability.isOpen) {
    throw createError(400, `Restaurant is closed on ${availability.dayOfWeek}s`);
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
  if (reservationDate > maxDate) {
    throw createError(400, `Reservations can only be made up to ${settings.maxAdvanceDays} days in advance`);
  }

  if (payload.numberOfGuests < settings.minGuestsPerReservation) {
    throw createError(400, `Minimum ${settings.minGuestsPerReservation} guest(s) required`);
  }
  if (payload.numberOfGuests > settings.maxGuestsPerReservation) {
    throw createError(400, `Maximum ${settings.maxGuestsPerReservation} guests allowed per reservation`);
  }

  const reservation = await BreakfastReservationRepository.create({ data: { ...payload, status: 'accepted' } });

  const emailData = {
    name: reservation.name,
    email: reservation.email,
    contactNumber: reservation.contactNumber,
    numberOfGuests: reservation.numberOfGuests,
    reservationDate: formatDateForEmail(reservation.reservationDate),
    reservationId: String(reservation._id),
    createdAt: formatDateTimeForEmail(reservation.createdAt),
  };

  EmailService.sendBreakfastReservationAcceptedEmail(emailData).catch((err) => {
    logger.error('Failed to send breakfast reservation confirmation email to customer:', err);
  });

  EmailService.sendBreakfastReservationAdminNotification(emailData).catch((err) => {
    logger.error('Failed to send breakfast reservation notification email to admin:', err);
  });

  return reservation;
};

const getAll = async (options?: {
  status?: BreakfastReservationStatus | BreakfastReservationStatus[];
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}): Promise<{ reservations: IBreakfastReservation[]; total: number }> => {
  const [reservations, total] = await Promise.all([
    BreakfastReservationRepository.getAll({ options }),
    BreakfastReservationRepository.count({ options }),
  ]);

  return { reservations, total };
};

const getById = async (id: string): Promise<IBreakfastReservation> => {
  const reservation = await BreakfastReservationRepository.getById({ id });
  if (!reservation) {
    throw createError(404, 'Breakfast reservation not found');
  }
  return reservation;
};

const updateStatus = async (id: string, payload: UpdateStatusPayload): Promise<IBreakfastReservation> => {
  const reservation = await BreakfastReservationRepository.getById({ id });
  if (!reservation) {
    throw createError(404, 'Breakfast reservation not found');
  }

  const { status } = payload;
  const currentStatus = reservation.status;

  if ((status === 'accepted' || status === 'rejected') && currentStatus !== 'pending') {
    throw createError(400, `Cannot ${status} a reservation that is not pending`);
  }

  if (status === 'cancelled' && !['pending', 'accepted'].includes(currentStatus)) {
    throw createError(400, 'Cannot cancel this reservation');
  }

  if (status === 'rejected' && !payload.rejectionReason) {
    throw createError(400, 'Rejection reason is required');
  }

  if (status === 'cancelled' && !payload.cancellationReason) {
    throw createError(400, 'Cancellation reason is required');
  }

  const updateData: Partial<IBreakfastReservation> = { status };
  if (payload.rejectionReason) updateData.rejectionReason = payload.rejectionReason;
  if (payload.cancellationReason) updateData.cancellationReason = payload.cancellationReason;
  if (payload.adminNote) updateData.adminNote = payload.adminNote;

  const updated = await BreakfastReservationRepository.update({ id, data: updateData });
  if (!updated) {
    throw createError(500, 'Failed to update breakfast reservation');
  }

  if (status === 'cancelled') {
    const emailData = {
      name: updated.name,
      email: updated.email,
      contactNumber: updated.contactNumber,
      numberOfGuests: updated.numberOfGuests,
      reservationDate: formatDateForEmail(updated.reservationDate),
      reservationId: String(updated._id),
      cancellationReason: payload.cancellationReason || '',
    };

    EmailService.sendBreakfastReservationCancelledEmail(emailData).catch((err) => {
      logger.error('Failed to send breakfast reservation cancelled email:', err);
    });
  }

  return updated;
};

const getByEmail = async (email: string): Promise<IBreakfastReservation[]> => {
  return BreakfastReservationRepository.getAll({ options: { email } });
};

export const BreakfastReservationService = {
  create,
  getAll,
  getById,
  updateStatus,
  getByEmail,
  getAvailableDates,
  getOpenDates,
};
