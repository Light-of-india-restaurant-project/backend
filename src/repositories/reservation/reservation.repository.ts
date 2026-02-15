import { ReservationModel } from '../../models/reservation/reservation.model';

import type { IReservation, ReservationStatus } from '../../models/reservation/reservation.model';
import type { RepositoryOptions } from '../repository.types';

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PaginationOptions extends RepositoryOptions {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
}

const create = async ({
  data,
  options,
}: {
  data: Partial<IReservation>;
  options?: RepositoryOptions;
}): Promise<IReservation> => {
  const result = await ReservationModel.create([data], options?.session ? { session: options.session } : undefined);
  return result[0];
};

const update = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IReservation>;
  options?: RepositoryOptions;
}): Promise<IReservation | null> => {
  return ReservationModel.findByIdAndUpdate(id, data, { new: true, session: options?.session }).populate('tableId');
};

const remove = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IReservation | null> => {
  return ReservationModel.findByIdAndDelete(id, { session: options?.session });
};

const getById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IReservation | null> => {
  return ReservationModel.findById(id, undefined, { session: options?.session }).populate('tableId');
};

const getByConfirmationCode = async ({
  confirmationCode,
  options,
}: {
  confirmationCode: string;
  options?: RepositoryOptions;
}): Promise<IReservation | null> => {
  return ReservationModel.findOne(
    { confirmationCode: confirmationCode.toUpperCase() },
    undefined,
    { session: options?.session },
  ).populate('tableId');
};

const getPaginated = async ({
  condition = {},
  options,
}: { condition?: object; options?: PaginationOptions } = {}): Promise<PaginatedResult<IReservation>> => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  // Build search condition
  let searchCondition = { ...condition };
  if (options?.search && options?.searchFields?.length) {
    const searchRegex = new RegExp(options.search, 'i');
    searchCondition = {
      ...condition,
      $or: options.searchFields.map((field) => ({ [field]: searchRegex })),
    };
  }

  const [data, total] = await Promise.all([
    ReservationModel.find(searchCondition, undefined, { session: options?.session })
      .populate('tableId')
      .sort(options?.sort || { date: -1, time: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    ReservationModel.countDocuments(searchCondition),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get reservations for a specific date to check availability
const getByDate = async ({
  date,
  status,
  options,
}: {
  date: Date;
  status?: ReservationStatus[];
  options?: RepositoryOptions;
}): Promise<IReservation[]> => {
  // Get start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const condition: Record<string, unknown> = {
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  // Only include non-cancelled reservations by default
  if (status && status.length > 0) {
    condition.status = { $in: status };
  } else {
    condition.status = { $nin: ['cancelled'] };
  }

  return ReservationModel.find(condition, undefined, { session: options?.session })
    .populate('tableId')
    .sort({ time: 1 })
    .exec();
};

// Get reservations for a specific table on a date
const getByTableAndDate = async ({
  tableId,
  date,
  options,
}: {
  tableId: string;
  date: Date;
  options?: RepositoryOptions;
}): Promise<IReservation[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return ReservationModel.find(
    {
      tableId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $nin: ['cancelled'] },
    },
    undefined,
    { session: options?.session },
  ).sort({ time: 1 }).exec();
};

// Get user's reservations
const getByUserId = async ({
  userId,
  options,
}: {
  userId: string;
  options?: PaginationOptions;
}): Promise<PaginatedResult<IReservation>> => {
  return getPaginated({
    condition: { userId },
    options: {
      ...options,
      sort: { date: -1, time: -1 },
    },
  });
};

// Update reservation status
const updateStatus = async ({
  id,
  status,
  options,
}: {
  id: string;
  status: ReservationStatus;
  options?: RepositoryOptions;
}): Promise<IReservation | null> => {
  return ReservationModel.findByIdAndUpdate(
    id,
    { status },
    { new: true, session: options?.session },
  ).populate('tableId');
};

export const ReservationRepository = {
  create,
  update,
  remove,
  getById,
  getByConfirmationCode,
  getPaginated,
  getByDate,
  getByTableAndDate,
  getByUserId,
  updateStatus,
};
