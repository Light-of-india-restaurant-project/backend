import { TableModel } from '../../models/reservation/table.model';

import type { ITable } from '../../models/reservation/table.model';
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
  data: Partial<ITable>;
  options?: RepositoryOptions;
}): Promise<ITable> => {
  const result = await TableModel.create([data], options?.session ? { session: options.session } : undefined);
  return result[0];
};

const update = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<ITable>;
  options?: RepositoryOptions;
}): Promise<ITable | null> => {
  return TableModel.findByIdAndUpdate(id, data, { new: true, session: options?.session }).populate('floor row');
};

const remove = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ITable | null> => {
  return TableModel.findByIdAndDelete(id, { session: options?.session });
};

const getById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ITable | null> => {
  return TableModel.findById(id, undefined, { session: options?.session }).populate('floor row');
};

const getAll = async ({
  condition = {},
  options,
}: { condition?: object; options?: RepositoryOptions } = {}): Promise<ITable[]> => {
  let query = TableModel.find(condition, undefined, { session: options?.session });
  if (options?.sort) query = query.sort(options.sort);
  return query.populate('floor row').exec();
};

const getPaginated = async ({
  condition = {},
  options,
}: { condition?: object; options?: PaginationOptions } = {}): Promise<PaginatedResult<ITable>> => {
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
    TableModel.find(searchCondition, undefined, { session: options?.session })
      .sort(options?.sort || { name: 1 })
      .skip(skip)
      .limit(limit)
      .populate('floor row')
      .exec(),
    TableModel.countDocuments(searchCondition),
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

const getActiveTablesByMinCapacity = async ({
  minCapacity,
  options,
}: {
  minCapacity: number;
  options?: RepositoryOptions;
}): Promise<ITable[]> => {
  return TableModel.find(
    {
      isActive: true,
      capacity: { $gte: minCapacity },
    },
    undefined,
    { session: options?.session },
  )
    .sort({ capacity: 1 }) // Sort by capacity ascending to get smallest suitable table first
    .populate('floor row')
    .exec();
};

const getByNameAndFloor = async ({
  name,
  floor,
  options,
}: {
  name: string;
  floor?: string;
  options?: RepositoryOptions;
}): Promise<ITable | null> => {
  const condition: Record<string, unknown> = { name };
  if (floor) {
    condition.floor = floor;
  } else {
    condition.floor = { $exists: false };
  }
  return TableModel.findOne(condition, undefined, { session: options?.session });
};

export const TableRepository = {
  create,
  update,
  remove,
  getById,
  getAll,
  getPaginated,
  getActiveTablesByMinCapacity,
  getByNameAndFloor,
};
