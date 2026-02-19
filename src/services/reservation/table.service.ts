import { DynamicMessages } from '../../constant/error';
import { TableRepository } from '../../repositories/reservation/table.repository';
import { FloorRepository } from '../../repositories/reservation/floor.repository';
import createError from '../../utils/http.error';

import type { ITable } from '../../models/reservation/table.model';
import type { IFloor } from '../../models/reservation/floor.model';

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
  floor?: string;
  row?: string;
  page?: number;
  limit?: number;
}

const create = async ({ payload }: { payload: Partial<ITable> }): Promise<ITable> => {
  // Check if table name already exists on the same floor
  const floorId = payload.floor ? String(payload.floor) : undefined;
  
  if (payload.name) {
    const existing = await TableRepository.getByNameAndFloor({ 
      name: payload.name, 
      floor: floorId 
    });
    
    if (existing) {
      // Get floor name for better error message
      let floorName = 'without a floor';
      if (floorId) {
        const floor = await FloorRepository.getById({ id: floorId });
        if (floor) {
          floorName = `on ${floor.name} (${floor.locationType})`;
        }
      }
      throw createError(400, `Table "${payload.name}" already exists ${floorName}`);
    }
  }
  
  return TableRepository.create({ data: payload });
};

const update = async ({ id, payload }: { id: string; payload: Partial<ITable> }): Promise<ITable> => {
  const existingTable = await TableRepository.getById({ id });
  if (!existingTable) {
    throw createError(404, DynamicMessages.notFoundMessage('Table'));
  }
  
  // Check for duplicate name on same floor if name or floor is being changed
  const newName = payload.name ?? existingTable.name;
  const newFloorId = payload.floor !== undefined 
    ? (payload.floor ? String(payload.floor) : undefined)
    : (existingTable.floor ? String((existingTable.floor as IFloor)._id || existingTable.floor) : undefined);
  
  const nameChanged = payload.name && payload.name !== existingTable.name;
  const floorChanged = payload.floor !== undefined;
  
  if (nameChanged || floorChanged) {
    const duplicate = await TableRepository.getByNameAndFloor({ 
      name: newName, 
      floor: newFloorId 
    });
    
    if (duplicate && String((duplicate as ITable & { _id: { toString(): string } })._id) !== id) {
      let floorName = 'without a floor';
      if (newFloorId) {
        const floor = await FloorRepository.getById({ id: newFloorId });
        if (floor) {
          floorName = `on ${floor.name} (${floor.locationType})`;
        }
      }
      throw createError(400, `Table "${newName}" already exists ${floorName}`);
    }
  }
  
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
  const { search, isActive, floor, row, page, limit } = params;

  const condition: Record<string, unknown> = {};
  if (isActive !== undefined) {
    condition.isActive = isActive;
  }
  if (floor) {
    condition.floor = floor;
  }
  if (row) {
    condition.row = row;
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
