import { DynamicMessages } from '../../constant/error';
import { RowRepository } from '../../repositories/reservation/row.repository';
import { FloorRepository } from '../../repositories/reservation/floor.repository';
import { TableModel } from '../../models/reservation/table.model';
import createError from '../../utils/http.error';

import type { IRow } from '../../models/reservation/row.model';

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface RowQueryParams {
  search?: string;
  isActive?: boolean;
  floor?: string;
  page?: number;
  limit?: number;
}

const create = async ({ payload }: { payload: Partial<IRow> }): Promise<IRow> => {
  // Validate floor exists
  if (payload.floor) {
    const floor = await FloorRepository.getById({ id: String(payload.floor) });
    if (!floor) {
      throw createError(400, 'Floor not found');
    }
  }

  const row = await RowRepository.create({ data: payload });
  // Return with populated floor
  return RowRepository.getById({ id: String(row._id) }) as Promise<IRow>;
};

const update = async ({ id, payload }: { id: string; payload: Partial<IRow> }): Promise<IRow> => {
  // If updating floor, validate it exists
  if (payload.floor) {
    const floor = await FloorRepository.getById({ id: String(payload.floor) });
    if (!floor) {
      throw createError(400, 'Floor not found');
    }
  }

  const row = await RowRepository.update({ id, data: payload });
  if (!row) {
    throw createError(404, DynamicMessages.notFoundMessage('Row'));
  }
  return row;
};

const remove = async ({ id }: { id: string }): Promise<void> => {
  // Check if any tables are using this row
  const tableCount = await TableModel.countDocuments({ row: id });
  if (tableCount > 0) {
    throw createError(400, 'Cannot delete row with existing tables. Remove tables from this row first.');
  }

  const row = await RowRepository.remove({ id });
  if (!row) {
    throw createError(404, DynamicMessages.notFoundMessage('Row'));
  }
};

const getById = async ({ id }: { id: string }): Promise<IRow> => {
  const row = await RowRepository.getById({ id });
  if (!row) {
    throw createError(404, DynamicMessages.notFoundMessage('Row'));
  }
  return row;
};

const getAll = async ({ isActive, floor }: { isActive?: boolean; floor?: string } = {}): Promise<IRow[]> => {
  const condition: Record<string, unknown> = {};
  if (isActive !== undefined) {
    condition.isActive = isActive;
  }
  if (floor) {
    condition.floor = floor;
  }
  return RowRepository.getAll({
    condition,
    options: { sort: { rowNumber: 1 }, populate: 'floor' },
  });
};

const getByFloor = async ({ floorId }: { floorId: string }): Promise<IRow[]> => {
  return RowRepository.getByFloor({ floorId });
};

const getPaginated = async ({ params }: { params: RowQueryParams }): Promise<PaginatedResult<IRow>> => {
  const { search, isActive, floor, page, limit } = params;

  const condition: Record<string, unknown> = {};
  if (isActive !== undefined) {
    condition.isActive = isActive;
  }
  if (floor) {
    condition.floor = floor;
  }

  return RowRepository.getPaginated({
    condition,
    options: {
      page,
      limit,
      search,
      searchFields: ['name', 'description'],
      sort: { rowNumber: 1 },
      populate: 'floor',
    },
  });
};

export const RowService = {
  create,
  update,
  remove,
  getById,
  getAll,
  getByFloor,
  getPaginated,
};
