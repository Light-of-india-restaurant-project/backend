import { SimpleReservationModel } from '../../models/reservation/simple-reservation.model';

import type { ISimpleReservation, SimpleReservationStatus } from '../../models/reservation/simple-reservation.model';
import type { RepositoryOptions } from '../repository.types';

interface SimpleReservationQueryOptions extends RepositoryOptions {
  status?: SimpleReservationStatus | SimpleReservationStatus[];
  startDate?: Date;
  endDate?: Date;
  email?: string;
}

const create = async ({
  data,
  options,
}: {
  data: Partial<ISimpleReservation>;
  options?: RepositoryOptions;
}): Promise<ISimpleReservation> => {
  return SimpleReservationModel.create([data], options?.session ? { session: options.session } : undefined).then(
    (res) => res[0],
  );
};

const update = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<ISimpleReservation>;
  options?: RepositoryOptions;
}): Promise<ISimpleReservation | null> => {
  return SimpleReservationModel.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

const remove = async ({ id, options }: { id: string; options?: RepositoryOptions }): Promise<ISimpleReservation | null> => {
  return SimpleReservationModel.findByIdAndDelete(id, { session: options?.session });
};

const getById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ISimpleReservation | null> => {
  return SimpleReservationModel.findById(id, undefined, { session: options?.session });
};

const getAll = async ({ options }: { options?: SimpleReservationQueryOptions } = {}): Promise<ISimpleReservation[]> => {
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

  let query = SimpleReservationModel.find(filter, undefined, { session: options?.session }).sort(
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

const count = async ({ options }: { options?: SimpleReservationQueryOptions } = {}): Promise<number> => {
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

  return SimpleReservationModel.countDocuments(filter, { session: options?.session });
};

export const SimpleReservationRepository = {
  create,
  update,
  remove,
  getById,
  getAll,
  count,
};
