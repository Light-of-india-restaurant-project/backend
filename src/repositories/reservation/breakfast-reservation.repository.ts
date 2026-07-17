import { BreakfastReservationModel } from '../../models/reservation/breakfast-reservation.model';

import type {
  IBreakfastReservation,
  BreakfastReservationStatus,
} from '../../models/reservation/breakfast-reservation.model';
import type { RepositoryOptions } from '../repository.types';

interface BreakfastReservationQueryOptions extends RepositoryOptions {
  status?: BreakfastReservationStatus | BreakfastReservationStatus[];
  startDate?: Date;
  endDate?: Date;
  email?: string;
}

const create = async ({
  data,
  options,
}: {
  data: Partial<IBreakfastReservation>;
  options?: RepositoryOptions;
}): Promise<IBreakfastReservation> => {
  return BreakfastReservationModel.create([data], options?.session ? { session: options.session } : undefined).then(
    (res) => res[0],
  );
};

const update = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IBreakfastReservation>;
  options?: RepositoryOptions;
}): Promise<IBreakfastReservation | null> => {
  return BreakfastReservationModel.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

const remove = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IBreakfastReservation | null> => {
  return BreakfastReservationModel.findByIdAndDelete(id, { session: options?.session });
};

const getById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IBreakfastReservation | null> => {
  return BreakfastReservationModel.findById(id, undefined, { session: options?.session });
};

const getAll = async ({ options }: { options?: BreakfastReservationQueryOptions } = {}): Promise<IBreakfastReservation[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (options?.status) {
    if (Array.isArray(options.status)) {
      filter.status = { $in: options.status };
    } else {
      filter.status = options.status;
    }
  }

  if (options?.email) {
    filter.email = options.email;
  }

  if (options?.startDate || options?.endDate) {
    filter.reservationDate = {};
    if (options?.startDate) {
      filter.reservationDate.$gte = options.startDate;
    }
    if (options?.endDate) {
      filter.reservationDate.$lte = options.endDate;
    }
  }

  let query = BreakfastReservationModel.find(filter, undefined, { session: options?.session }).sort(
    options?.sort || { createdAt: -1 },
  );

  if (options?.skip) {
    query = query.skip(options.skip);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query.exec();
};

const count = async ({ options }: { options?: BreakfastReservationQueryOptions } = {}): Promise<number> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (options?.status) {
    if (Array.isArray(options.status)) {
      filter.status = { $in: options.status };
    } else {
      filter.status = options.status;
    }
  }

  if (options?.email) {
    filter.email = options.email;
  }

  if (options?.startDate || options?.endDate) {
    filter.reservationDate = {};
    if (options?.startDate) {
      filter.reservationDate.$gte = options.startDate;
    }
    if (options?.endDate) {
      filter.reservationDate.$lte = options.endDate;
    }
  }

  return BreakfastReservationModel.countDocuments(filter, { session: options?.session });
};

export const BreakfastReservationRepository = {
  create,
  update,
  remove,
  getById,
  getAll,
  count,
};
