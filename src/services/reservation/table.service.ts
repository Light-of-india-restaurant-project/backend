import { DynamicMessages } from '../../constant/error';
import { TableRepository } from '../../repositories/reservation/table.repository';
import createError from '../../utils/http.error';

import type { ITable } from '../../models/reservation/table.model';

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TableQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const create = async ({ payload }: { payload: Partial<ITable> }): Promise<ITable> => {
  return TableRepository.create({ data: payload });
};

const update = async ({ id, payload }: { id: string; payload: Partial<ITable> }): Promise<ITable> => {
  const table = await TableRepository.update({ id, data: payload });
  if (!table) {
    throw createError(404, DynamicMessages.notFoundMessage('Table'));
  }
  return table;
};

const remove = async ({ id }: { id: string }): Promise<void> => {
  const table = await TableRepository.remove({ id });
  if (!table) {
    throw createError(404, DynamicMessages.notFoundMessage('Table'));
  }
};

const getById = async ({ id }: { id: string }): Promise<ITable> => {
  const table = await TableRepository.getById({ id });
  if (!table) {
    throw createError(404, DynamicMessages.notFoundMessage('Table'));
  }
  return table;
};

const getAll = async ({ isActive }: { isActive?: boolean } = {}): Promise<ITable[]> => {
  const condition: Record<string, unknown> = {};
  if (isActive !== undefined) {
    condition.isActive = isActive;
  }
  return TableRepository.getAll({
    condition,
    options: { sort: { name: 1 } },
  });
};

const getPaginated = async ({
  params,
}: {
  params: TableQueryParams;
}): Promise<PaginatedResult<ITable>> => {
  const { search, isActive, page, limit } = params;

  const condition: Record<string, unknown> = {};
  if (isActive !== undefined) {
    condition.isActive = isActive;
  }

  return TableRepository.getPaginated({
    condition,
    options: {
      page,
      limit,
      search,
      searchFields: ['name', 'description'],
      sort: { name: 1 },
    },
  });
};

const getActiveTablesByMinCapacity = async ({ minCapacity }: { minCapacity: number }): Promise<ITable[]> => {
  return TableRepository.getActiveTablesByMinCapacity({ minCapacity });
};

export const TableService = {
  create,
  update,
  remove,
  getById,
  getAll,
  getPaginated,
  getActiveTablesByMinCapacity,
};
