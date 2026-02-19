import { FloorModel } from '../../models/reservation/floor.model';

import type { IFloor } from '../../models/reservation/floor.model';
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
  data: Partial<IFloor>;
  options?: RepositoryOptions;
}): Promise<IFloor> => {
  const result = await FloorModel.create([data], options?.session ? { session: options.session } : undefined);
  return result[0];
};

const update = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IFloor>;
  options?: RepositoryOptions;
}): Promise<IFloor | null> => {
  return FloorModel.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

const remove = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IFloor | null> => {
  return FloorModel.findByIdAndDelete(id, { session: options?.session });
};

const getById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IFloor | null> => {
  return FloorModel.findById(id, undefined, { session: options?.session });
};

const getAll = async ({
  condition = {},
  options,
}: { condition?: object; options?: RepositoryOptions } = {}): Promise<IFloor[]> => {
  let query = FloorModel.find(condition, undefined, { session: options?.session });
  if (options?.sort) query = query.sort(options.sort);
  return query.exec();
};

const getPaginated = async ({
  condition = {},
  options,
}: { condition?: object; options?: PaginationOptions } = {}): Promise<PaginatedResult<IFloor>> => {
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
    FloorModel.find(searchCondition, undefined, { session: options?.session })
      .sort(options?.sort || { floorNumber: 1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    FloorModel.countDocuments(searchCondition),
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

const getByFloorNumber = async ({
  floorNumber,
  options,
}: {
  floorNumber: number;
  options?: RepositoryOptions;
}): Promise<IFloor | null> => {
  return FloorModel.findOne({ floorNumber }, undefined, { session: options?.session });
};

const getByFloorNumberAndLocationType = async ({
  floorNumber,
  locationType,
  options,
}: {
  floorNumber: number;
  locationType: string;
  options?: RepositoryOptions;
}): Promise<IFloor | null> => {
  return FloorModel.findOne({ floorNumber, locationType }, undefined, { session: options?.session });
};

export const FloorRepository = {
  create,
  update,
  remove,
  getById,
  getAll,
  getPaginated,
  getByFloorNumber,
  getByFloorNumberAndLocationType,
};
