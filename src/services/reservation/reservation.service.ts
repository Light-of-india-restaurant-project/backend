import { DynamicMessages } from '../../constant/error';
import { ReservationRepository } from '../../repositories/reservation/reservation.repository';
import { TableRepository } from '../../repositories/reservation/table.repository';
import { RestaurantSettingsRepository } from '../../repositories/reservation/restaurant-settings.repository';
import createError from '../../utils/http.error';
import EmailService from '../email/email.service';

import type { IReservation, ReservationStatus } from '../../models/reservation/reservation.model';
import type { ITable } from '../../models/reservation/table.model';
import type { DayOfWeek } from '../../models/reservation/restaurant-settings.model';

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ReservationQueryParams {
  search?: string;
  status?: ReservationStatus;
  date?: Date;
  page?: number;
  limit?: number;
}

interface CreateReservationInput {
  name: string;
  email: string;
  phone: string;
  date: Date | string;
  time: string;
  guests: number;
  specialRequests?: string;
  userId?: string;
}

interface AvailableSlot {
  time: string;
  tables: Array<{
    id: string;
    name: string;
    capacity: number;
    isAvailable: boolean;
  }>;
}

// Generate a unique confirmation code
const generateConfirmationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Convert time string to minutes from midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes from midnight to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Check if two time ranges overlap
const timeRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
};

// Get day of week from date
const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

// Get available time slots for a date
const getAvailableSlots = async ({
  date,
  guests,
}: {
  date: Date;
  guests: number;
}): Promise<AvailableSlot[]> => {
  const settings = await RestaurantSettingsRepository.getOrCreate();
  const dayOfWeek = getDayOfWeek(date);
  const daySettings = settings.operatingHours.find((h) => h.day === dayOfWeek);

  // Check if restaurant is open on this day
  if (!daySettings || !daySettings.isOpen) {
    return [];
  }

  // Validate guests count
  if (guests < settings.minGuestsPerReservation || guests > settings.maxGuestsPerReservation) {
    throw createError(400, `Guest count must be between ${settings.minGuestsPerReservation} and ${settings.maxGuestsPerReservation}`);
  }

  // Check if date is within allowed advance booking range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);

  const requestDate = new Date(date);
  requestDate.setHours(0, 0, 0, 0);

  if (requestDate < today) {
    throw createError(400, 'Cannot book for past dates');
  }

  if (requestDate > maxDate) {
    throw createError(400, `Reservations can only be made up to ${settings.maxAdvanceDays} days in advance`);
  }

  // Get ALL active tables
  const allTables = await TableRepository.getActiveTablesByMinCapacity({ minCapacity: 1 });

  if (allTables.length === 0) {
    return [];
  }

  // Get existing reservations for this date
  const existingReservations = await ReservationRepository.getByDate({ date });

  // Generate time slots
  const openMinutes = timeToMinutes(daySettings.openTime);
  const closeMinutes = timeToMinutes(daySettings.closeTime);
  const slots: AvailableSlot[] = [];

  // Last slot should allow full reservation duration before closing
  const lastSlotStart = closeMinutes - settings.reservationDuration;

  for (let slotStart = openMinutes; slotStart <= lastSlotStart; slotStart += settings.slotInterval) {
    const slotTime = minutesToTime(slotStart);
    const slotEnd = minutesToTime(slotStart + settings.reservationDuration);

    // Check availability for ALL tables
    const tablesWithAvailability: Array<{ id: string; name: string; capacity: number; isAvailable: boolean }> = [];

    for (const table of allTables) {
      const tableId = (table as ITable & { _id: { toString: () => string } })._id.toString();

      // Check if table can accommodate guests
      const canAccommodate = table.capacity >= guests;

      // Check if this table has any overlapping reservations
      const hasConflict = existingReservations.some((reservation) => {
        const resTableId = reservation.tableId && typeof reservation.tableId === 'object' && '_id' in reservation.tableId
          ? (reservation.tableId as unknown as { _id: { toString: () => string } })._id.toString()
          : reservation.tableId?.toString();

        if (resTableId !== tableId) return false;

        return timeRangesOverlap(slotTime, slotEnd, reservation.time, reservation.endTime);
      });

      tablesWithAvailability.push({
        id: tableId,
        name: table.name,
        capacity: table.capacity,
        isAvailable: canAccommodate && !hasConflict,
      });
    }

    // Sort tables: available first, then by capacity
    tablesWithAvailability.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      return a.capacity - b.capacity;
    });

    slots.push({
      time: slotTime,
      tables: tablesWithAvailability,
    });
  }

  // If checking for today, filter out past slots
  const now = new Date();
  if (requestDate.toDateString() === now.toDateString()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.filter((slot) => timeToMinutes(slot.time) > currentMinutes);
  }

  return slots;
};

// Create a new reservation
const create = async ({ payload }: { payload: CreateReservationInput }): Promise<IReservation> => {
  const { name, email, phone, date: dateInput, time, guests, specialRequests, userId } = payload;

  // Convert date string to Date object if needed
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  // Get settings for duration and validation
  const settings = await RestaurantSettingsRepository.getOrCreate();

  // Validate guests count
  if (guests < settings.minGuestsPerReservation || guests > settings.maxGuestsPerReservation) {
    throw createError(400, `Guest count must be between ${settings.minGuestsPerReservation} and ${settings.maxGuestsPerReservation}`);
  }

  // Get available slots to find a table
  const availableSlots = await getAvailableSlots({ date, guests });
  const matchingSlot = availableSlots.find((slot) => slot.time === time);

  if (!matchingSlot || matchingSlot.tables.length === 0) {
    throw createError(400, 'No available tables for the selected date and time');
  }

  // Assign the first available table (smallest that fits the party)
  const assignedTable = matchingSlot.tables[0];

  // Calculate end time
  const startMinutes = timeToMinutes(time);
  const endTime = minutesToTime(startMinutes + settings.reservationDuration);

  // Generate unique confirmation code
  let confirmationCode = generateConfirmationCode();
  let existingCode = await ReservationRepository.getByConfirmationCode({ confirmationCode });
  while (existingCode) {
    confirmationCode = generateConfirmationCode();
    existingCode = await ReservationRepository.getByConfirmationCode({ confirmationCode });
  }

  const reservationData: Partial<IReservation> = {
    name,
    email,
    phone,
    date,
    time,
    endTime,
    guests,
    tableId: assignedTable.id as unknown as IReservation['tableId'],
    status: 'pending',
    confirmationCode,
    specialRequests,
  };

  if (userId) {
    reservationData.userId = userId as unknown as IReservation['userId'];
  }

  const reservation = await ReservationRepository.create({ data: reservationData });

  // Format date for email
  const formattedDate = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Send confirmation email to customer
  EmailService.sendReservationConfirmationEmail({
    email,
    name,
    confirmationCode,
    date: formattedDate,
    time,
    guests,
    tableName: assignedTable.name,
    specialRequests,
  });

  // Send notification to admin
  EmailService.sendReservationAdminNotification({
    email,
    name,
    phone,
    confirmationCode,
    date: formattedDate,
    time,
    guests,
    tableName: assignedTable.name,
    specialRequests,
    createdAt: new Date().toLocaleString(),
  });

  return reservation;
};

// Get reservation by ID
const getById = async ({ id }: { id: string }): Promise<IReservation> => {
  const reservation = await ReservationRepository.getById({ id });
  if (!reservation) {
    throw createError(404, DynamicMessages.notFoundMessage('Reservation'));
  }
  return reservation;
};

// Get reservation by confirmation code
const getByConfirmationCode = async ({ confirmationCode }: { confirmationCode: string }): Promise<IReservation> => {
  const reservation = await ReservationRepository.getByConfirmationCode({ confirmationCode });
  if (!reservation) {
    throw createError(404, DynamicMessages.notFoundMessage('Reservation'));
  }
  return reservation;
};

// Get paginated reservations (admin)
const getPaginated = async ({
  params,
}: {
  params: ReservationQueryParams;
}): Promise<PaginatedResult<IReservation>> => {
  const { search, status, date, page, limit } = params;

  const condition: Record<string, unknown> = {};

  if (status) {
    condition.status = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    condition.date = { $gte: startOfDay, $lte: endOfDay };
  }

  return ReservationRepository.getPaginated({
    condition,
    options: {
      page,
      limit,
      search,
      searchFields: ['name', 'email', 'phone', 'confirmationCode'],
      sort: { date: -1, time: -1 },
    },
  });
};

// Get user's reservations
const getByUserId = async ({
  userId,
  page,
  limit,
}: {
  userId: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<IReservation>> => {
  return ReservationRepository.getByUserId({ userId, options: { page, limit } });
};

// Update reservation (admin)
const update = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<IReservation>;
}): Promise<IReservation> => {
  const reservation = await ReservationRepository.update({ id, data: payload });
  if (!reservation) {
    throw createError(404, DynamicMessages.notFoundMessage('Reservation'));
  }
  return reservation;
};

// Update reservation status
const updateStatus = async ({
  id,
  status,
}: {
  id: string;
  status: ReservationStatus;
}): Promise<IReservation> => {
  const reservation = await ReservationRepository.updateStatus({ id, status });
  if (!reservation) {
    throw createError(404, DynamicMessages.notFoundMessage('Reservation'));
  }
  return reservation;
};

// Cancel reservation (by customer or admin)
const cancel = async ({ id }: { id: string }): Promise<IReservation> => {
  return updateStatus({ id, status: 'cancelled' });
};

// Confirm reservation (admin)
const confirm = async ({ id }: { id: string }): Promise<IReservation> => {
  return updateStatus({ id, status: 'confirmed' });
};

// Mark reservation as completed
const complete = async ({ id }: { id: string }): Promise<IReservation> => {
  return updateStatus({ id, status: 'completed' });
};

// Mark reservation as no-show
const markNoShow = async ({ id }: { id: string }): Promise<IReservation> => {
  return updateStatus({ id, status: 'no-show' });
};

// Delete reservation (admin only)
const remove = async ({ id }: { id: string }): Promise<void> => {
  const reservation = await ReservationRepository.remove({ id });
  if (!reservation) {
    throw createError(404, DynamicMessages.notFoundMessage('Reservation'));
  }
};

export const ReservationService = {
  getAvailableSlots,
  create,
  getById,
  getByConfirmationCode,
  getPaginated,
  getByUserId,
  update,
  updateStatus,
  cancel,
  confirm,
  complete,
  markNoShow,
  remove,
};
