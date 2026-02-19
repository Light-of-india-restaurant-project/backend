import { DynamicMessages } from '../../constant/error';
import { FloorRepository } from '../../repositories/reservation/floor.repository';
import { RowRepository } from '../../repositories/reservation/row.repository';
import createError from '../../utils/http.error';

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

interface FloorQueryParams {
  search?: string;
  isActive?: boolean;
  locationType?: string;
  page?: number;
  limit?: number;
}

const create = async ({ payload }: { payload: Partial<IFloor> }): Promise<IFloor> => {
  // Check if floor number + location type combination already exists
  if (payload.floorNumber !== undefined && payload.locationType) {
    const existing = await FloorRepository.getByFloorNumberAndLocationType({ 
      floorNumber: payload.floorNumber,
      locationType: payload.locationType 
    });
    if (existing) {
      throw createError(400, `Floor ${payload.floorNumber} with ${payload.locationType} location already exists`);
    }
  }
  return FloorRepository.create({ data: payload });
};

const update = async ({ id, payload }: { id: string; payload: Partial<IFloor> }): Promise<IFloor> => {
  // If updating floor number or location type, check for duplicates
  const existingFloor = await FloorRepository.getById({ id });
  if (!existingFloor) {
    throw createError(404, DynamicMessages.notFoundMessage('Floor'));
  }
  
  const newFloorNumber = payload.floorNumber ?? existingFloor.floorNumber;
  const newLocationType = payload.locationType ?? existingFloor.locationType;
  
  // Only check if floorNumber or locationType is changing
  if (newFloorNumber !== existingFloor.floorNumber || newLocationType !== existingFloor.locationType) {
    const duplicate = await FloorRepository.getByFloorNumberAndLocationType({ 
      floorNumber: newFloorNumber, 
      locationType: newLocationType 
    });
    if (duplicate && (duplicate as IFloor & { _id: { toString(): string } })._id.toString() !== id) {
      throw createError(400, `Floor ${newFloorNumber} with ${newLocationType} location already exists`);
    }
  }

  const floor = await FloorRepository.update({ id, data: payload });
  if (!floor) {
    throw createError(404, DynamicMessages.notFoundMessage('Floor'));
  }
  return floor;
};

const remove = async ({ id }: { id: string }): Promise<void> => {
  // Check if floor has rows
  const rowCount = await RowRepository.countByFloor({ floorId: id });
  if (rowCount > 0) {
    throw createError(400, 'Cannot delete floor with existing rows. Delete the rows first.');
  }

  const floor = await FloorRepository.remove({ id });
  if (!floor) {
    throw createError(404, DynamicMessages.notFoundMessage('Floor'));
  }
};

const getById = async ({ id }: { id: string }): Promise<IFloor> => {
  const floor = await FloorRepository.getById({ id });
  if (!floor) {
    throw createError(404, DynamicMessages.notFoundMessage('Floor'));
  }
  return floor;
};

const getAll = async ({ isActive, locationType }: { isActive?: boolean; locationType?: string } = {}): Promise<
  IFloor[]
> => {
  const condition: Record<string, unknown> = {};
  if (isActive !== undefined) {
    condition.isActive = isActive;
  }
  if (locationType) {
    condition.locationType = locationType;
  }
  return FloorRepository.getAll({
    condition,
    options: { sort: { floorNumber: 1 } },
  });
};

const getPaginated = async ({ params }: { params: FloorQueryParams }): Promise<PaginatedResult<IFloor>> => {
  const { search, isActive, locationType, page, limit } = params;

  const condition: Record<string, unknown> = {};
  if (isActive !== undefined) {
    condition.isActive = isActive;
  }
  if (locationType) {
    condition.locationType = locationType;
  }

  return FloorRepository.getPaginated({
    condition,
    options: {
      page,
      limit,
      search,
      searchFields: ['name', 'description'],
      sort: { floorNumber: 1 },
    },
  });
};

export const FloorService = {
  create,
  update,
  remove,
  getById,
  getAll,
  getPaginated,
};
