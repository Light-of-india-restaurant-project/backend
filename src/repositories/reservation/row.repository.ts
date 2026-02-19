import { RowModel } from '../../models/reservation/row.model';

import type { IRow } from '../../models/reservation/row.model';
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
  populate?: string | string[];
}

const create = async ({
  data,
  options,
}: {
  data: Partial<IRow>;
  options?: RepositoryOptions;
}): Promise<IRow> => {
  const result = await RowModel.create([data], options?.session ? { session: options.session } : undefined);
  return result[0];
};

const update = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IRow>;
  options?: RepositoryOptions;
}): Promise<IRow | null> => {
  return RowModel.findByIdAndUpdate(id, data, { new: true, session: options?.session }).populate('floor');
};

const remove = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IRow | null> => {
  return RowModel.findByIdAndDelete(id, { session: options?.session });
};

const getById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IRow | null> => {
  return RowModel.findById(id, undefined, { session: options?.session }).populate('floor');
};

const getAll = async ({
  condition = {},
  options,
}: { condition?: object; options?: RepositoryOptions & { populate?: string | string[] } } = {}): Promise<IRow[]> => {
  let query = RowModel.find(condition, undefined, { session: options?.session });
  if (options?.sort) query = query.sort(options.sort);
  if (options?.populate) query = query.populate(options.populate);
  return query.exec();
};

const getPaginated = async ({
  condition = {},
  options,
}: { condition?: object; options?: PaginationOptions } = {}): Promise<PaginatedResult<IRow>> => {
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

  let query = RowModel.find(searchCondition, undefined, { session: options?.session })
    .sort(options?.sort || { rowNumber: 1 })
    .skip(skip)
    .limit(limit);

  if (options?.populate) query = query.populate(options.populate);

  const [data, total] = await Promise.all([query.exec(), RowModel.countDocuments(searchCondition)]);

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

const getByFloor = async ({
  floorId,
  options,
}: {
  floorId: string;
  options?: RepositoryOptions;
}): Promise<IRow[]> => {
  return RowModel.find({ floor: floorId, isActive: true }, undefined, { session: options?.session })
    .sort({ rowNumber: 1 })
    .populate('floor')
    .exec();
};

const countByFloor = async ({
  floorId,
  options,
}: {
  floorId: string;
  options?: RepositoryOptions;
}): Promise<number> => {
  return RowModel.countDocuments({ floor: floorId }, { session: options?.session });
};

export const RowRepository = {
  create,
  update,
  remove,
  getById,
  getAll,
  getPaginated,
  getByFloor,
  countByFloor,
};
