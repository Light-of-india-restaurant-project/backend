import createError from 'http-errors';

import { SimpleReservationRepository } from '../../repositories/reservation/simple-reservation.repository';
import { RestaurantSettingsRepository } from '../../repositories/reservation/restaurant-settings.repository';
import EmailService from '../email/email.service';
import logger from '../../utils/logger';

import type { ISimpleReservation, SimpleReservationStatus } from '../../models/reservation/simple-reservation.model';

interface CreateReservationPayload {
  name: string;
  email: string;
  contactNumber: string;
  numberOfGuests: number;
  reservationDate: Date;
}

interface UpdateStatusPayload {
  status: SimpleReservationStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  adminNote?: string;
}

// Helper to format date for emails
const formatDateForEmail = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Helper to format datetime for emails
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

// Helper to check if a date is in the closedDates array
const isDateClosed = (date: Date, closedDates: Date[]): boolean => {
  const dateStr = date.toISOString().split('T')[0];
  return closedDates.some((closedDate) => {
    const closedStr = new Date(closedDate).toISOString().split('T')[0];
    return dateStr === closedStr;
  });
};

// Get operating hours to check if day is open
const getAvailableDates = async (): Promise<{ date: Date; isOpen: boolean; dayName: string }[]> => {
  const settings = await RestaurantSettingsRepository.getOrCreate();
  const dates: { date: Date; isOpen: boolean; dayName: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closedDates = settings.closedDates || [];

  for (let i = 0; i < settings.maxAdvanceDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayIndex = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayIndex];
    const operatingHour = settings.operatingHours.find((oh) => oh.day === dayName);
    
    // Check both weekly operating hours and specific closed dates
    const isOpenByWeek = operatingHour?.isOpen ?? false;
    const isClosedSpecifically = isDateClosed(date, closedDates);
    const isOpen = isOpenByWeek && !isClosedSpecifically;

    dates.push({
      date,
      isOpen,
      dayName,
    });
  }

  return dates;
};

// Get only open dates
const getOpenDates = async (): Promise<{ date: Date; dayName: string; isOpen: boolean }[]> => {
  const allDates = await getAvailableDates();
  // Return all dates with their open status so frontend can show closed dates as disabled
  return allDates.map(({ date, dayName, isOpen }) => ({ date, dayName, isOpen }));
};

// Create a new reservation
const create = async (payload: CreateReservationPayload): Promise<ISimpleReservation> => {
  // Validate date is not in the past
  const reservationDate = new Date(payload.reservationDate);
  reservationDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (reservationDate < today) {
    throw createError(400, 'Reservation date cannot be in the past');
  }

  // Check if the day is open
  const settings = await RestaurantSettingsRepository.getOrCreate();
  const dayIndex = reservationDate.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayIndex];
  const operatingHour = settings.operatingHours.find((oh) => oh.day === dayName);

  if (!operatingHour?.isOpen) {
    throw createError(400, `Restaurant is closed on ${dayName}s`);
  }

  // Check if specific date is closed (holiday, etc.)
  const closedDates = settings.closedDates || [];
  if (isDateClosed(reservationDate, closedDates)) {
    throw createError(400, 'Restaurant is closed on this specific date');
  }

  // Check if date is within allowed advance days
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
  if (reservationDate > maxDate) {
    throw createError(400, `Reservations can only be made up to ${settings.maxAdvanceDays} days in advance`);
  }

  // Validate number of guests
  if (payload.numberOfGuests < settings.minGuestsPerReservation) {
    throw createError(400, `Minimum ${settings.minGuestsPerReservation} guest(s) required`);
  }
  if (payload.numberOfGuests > settings.maxGuestsPerReservation) {
    throw createError(400, `Maximum ${settings.maxGuestsPerReservation} guests allowed per reservation`);
  }

  const reservation = await SimpleReservationRepository.create({ data: { ...payload, status: 'pending' } });

  // Send emails (don't block the response)
  const emailData = {
    name: reservation.name,
    email: reservation.email,
    contactNumber: reservation.contactNumber,
    numberOfGuests: reservation.numberOfGuests,
    reservationDate: formatDateForEmail(reservation.reservationDate),
    reservationId: String(reservation._id),
    createdAt: formatDateTimeForEmail(reservation.createdAt),
  };

  // Send confirmation email to customer
  EmailService.sendSimpleReservationReceivedEmail(emailData).catch((err) => {
    logger.error('Failed to send reservation received email to customer:', err);
  });

  // Send notification email to admin
  EmailService.sendSimpleReservationAdminNotification(emailData).catch((err) => {
    logger.error('Failed to send reservation notification email to admin:', err);
  });

  return reservation;
};

// Get all reservations (admin)
const getAll = async (options?: {
  status?: SimpleReservationStatus | SimpleReservationStatus[];
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  limit?: number;
}): Promise<{ reservations: ISimpleReservation[]; total: number }> => {
  const [reservations, total] = await Promise.all([
    SimpleReservationRepository.getAll({ options }),
    SimpleReservationRepository.count({ options }),
  ]);

  return { reservations, total };
};

// Get reservation by ID
const getById = async (id: string): Promise<ISimpleReservation> => {
  const reservation = await SimpleReservationRepository.getById({ id });
  if (!reservation) {
    throw createError(404, 'Reservation not found');
  }
  return reservation;
};

// Update reservation status (admin)
const updateStatus = async (id: string, payload: UpdateStatusPayload): Promise<ISimpleReservation> => {
  const reservation = await SimpleReservationRepository.getById({ id });
  if (!reservation) {
    throw createError(404, 'Reservation not found');
  }

  // Validate status transitions
  const { status } = payload;
  const currentStatus = reservation.status;

  // Only pending reservations can be accepted or rejected
  if ((status === 'accepted' || status === 'rejected') && currentStatus !== 'pending') {
    throw createError(400, `Cannot ${status} a reservation that is not pending`);
  }

  // Can only cancel pending or accepted reservations
  if (status === 'cancelled' && !['pending', 'accepted'].includes(currentStatus)) {
    throw createError(400, 'Cannot cancel this reservation');
  }

  // Rejection reason is required when rejecting
  if (status === 'rejected' && !payload.rejectionReason) {
    throw createError(400, 'Rejection reason is required');
  }

  // Cancellation reason is required when cancelling
  if (status === 'cancelled' && !payload.cancellationReason) {
    throw createError(400, 'Cancellation reason is required');
  }

  const updateData: Partial<ISimpleReservation> = { status };
  if (payload.rejectionReason) updateData.rejectionReason = payload.rejectionReason;
  if (payload.cancellationReason) updateData.cancellationReason = payload.cancellationReason;
  if (payload.adminNote) updateData.adminNote = payload.adminNote;

  const updated = await SimpleReservationRepository.update({ id, data: updateData });
  if (!updated) {
    throw createError(500, 'Failed to update reservation');
  }

  // Send status update email to customer (don't block the response)
  const baseEmailData = {
    name: updated.name,
    email: updated.email,
    contactNumber: updated.contactNumber,
    numberOfGuests: updated.numberOfGuests,
    reservationDate: formatDateForEmail(updated.reservationDate),
    reservationId: String(updated._id),
  };

  if (status === 'accepted') {
    EmailService.sendSimpleReservationAcceptedEmail(baseEmailData).catch((err) => {
      logger.error('Failed to send reservation accepted email:', err);
    });
  } else if (status === 'rejected') {
    EmailService.sendSimpleReservationRejectedEmail({
      ...baseEmailData,
      rejectionReason: payload.rejectionReason || '',
    }).catch((err) => {
      logger.error('Failed to send reservation rejected email:', err);
    });
  } else if (status === 'cancelled') {
    EmailService.sendSimpleReservationCancelledEmail({
      ...baseEmailData,
      cancellationReason: payload.cancellationReason || '',
    }).catch((err) => {
      logger.error('Failed to send reservation cancelled email:', err);
    });
  }

  return updated;
};

// Delete reservation (admin)
const remove = async (id: string): Promise<void> => {
  const reservation = await SimpleReservationRepository.getById({ id });
  if (!reservation) {
    throw createError(404, 'Reservation not found');
  }

  await SimpleReservationRepository.remove({ id });
};

// Get reservations by email (for customer to check their reservations)
const getByEmail = async (email: string): Promise<ISimpleReservation[]> => {
  return SimpleReservationRepository.getAll({ options: { email } });
};

export const SimpleReservationService = {
  create,
  getAll,
  getById,
  updateStatus,
  remove,
  getByEmail,
  getAvailableDates,
  getOpenDates,
};
