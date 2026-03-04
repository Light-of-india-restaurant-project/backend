import { CateringPackModel, CateringOrderModel } from '../../models/catering/catering.model';

import type { ICateringPack, ICateringOrder, DeliveryStatus } from '../../models/catering/catering.model';
import type { RepositoryOptions } from '../repository.types';

// ============ CATERING PACK REPOSITORY ============

const createPack = async ({
  data,
  options,
}: {
  data: Partial<ICateringPack>;
  options?: RepositoryOptions;
}): Promise<ICateringPack> => {
  const result = await CateringPackModel.create(
    [data],
    options?.session ? { session: options.session } : undefined,
  );
  return result[0];
};

const updatePack = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<ICateringPack>;
  options?: RepositoryOptions;
}): Promise<ICateringPack | null> => {
  return CateringPackModel.findByIdAndUpdate(id, data, {
    new: true,
    session: options?.session,
  });
};

const deletePack = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ICateringPack | null> => {
  return CateringPackModel.findByIdAndDelete(id, {
    session: options?.session,
  });
};

const getPackById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ICateringPack | null> => {
  let query = CateringPackModel.findById(id);
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  if (options?.session) {
    query = query.session(options.session);
  }
  return query.exec();
};

const getAllPacks = async ({
  filter = {},
  options,
}: {
  filter?: Record<string, unknown>;
  options?: RepositoryOptions;
}): Promise<ICateringPack[]> => {
  let query = CateringPackModel.find(filter);
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  if (options?.sort) {
    query = query.sort(options.sort);
  }
  if (options?.session) {
    query = query.session(options.session);
  }
  return query.exec();
};

const getPacksPaginated = async ({
  filter = {},
  options,
}: {
  filter?: Record<string, unknown>;
  options?: RepositoryOptions;
}): Promise<{
  data: ICateringPack[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> => {
  const page = options?.skip ? Math.floor(options.skip / (options?.limit || 10)) + 1 : 1;
  const limit = options?.limit || 10;
  const skip = options?.skip || 0;

  let query = CateringPackModel.find(filter);
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  if (options?.sort) {
    query = query.sort(options.sort);
  }
  query = query.skip(skip).limit(limit);
  if (options?.session) {
    query = query.session(options.session);
  }

  const [data, total] = await Promise.all([
    query.exec(),
    CateringPackModel.countDocuments(filter),
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

const getActivePacks = async ({
  options,
}: {
  options?: RepositoryOptions;
} = {}): Promise<ICateringPack[]> => {
  return getAllPacks({
    filter: { isActive: true },
    options: {
      ...options,
      sort: { sortOrder: 1, createdAt: -1 },
      populate: {
        path: 'menuItems',
        select: 'name description descriptionNl price isVegetarian isSpicy',
      },
    },
  });
};

// ============ CATERING ORDER REPOSITORY ============

const createOrder = async ({
  data,
  options,
}: {
  data: Partial<ICateringOrder>;
  options?: RepositoryOptions;
}): Promise<ICateringOrder> => {
  const result = await CateringOrderModel.create(
    [data],
    options?.session ? { session: options.session } : undefined,
  );
  return result[0];
};

const updateOrder = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<ICateringOrder>;
  options?: RepositoryOptions;
}): Promise<ICateringOrder | null> => {
  return CateringOrderModel.findByIdAndUpdate(id, data, {
    new: true,
    session: options?.session,
  });
};

const getOrderById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ICateringOrder | null> => {
  let query = CateringOrderModel.findById(id);
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  if (options?.session) {
    query = query.session(options.session);
  }
  return query.exec();
};

const getOrderByPaymentId = async ({
  paymentId,
  options,
}: {
  paymentId: string;
  options?: RepositoryOptions;
}): Promise<ICateringOrder | null> => {
  let query = CateringOrderModel.findOne({ paymentId });
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  if (options?.session) {
    query = query.session(options.session);
  }
  return query.exec();
};

const getAllOrders = async ({
  filter = {},
  options,
}: {
  filter?: Record<string, unknown>;
  options?: RepositoryOptions;
}): Promise<ICateringOrder[]> => {
  let query = CateringOrderModel.find(filter);
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  if (options?.sort) {
    query = query.sort(options.sort);
  }
  if (options?.session) {
    query = query.session(options.session);
  }
  return query.exec();
};

const getOrdersPaginated = async ({
  filter = {},
  options,
}: {
  filter?: Record<string, unknown>;
  options?: RepositoryOptions;
}): Promise<{
  data: ICateringOrder[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> => {
  const page = options?.skip ? Math.floor(options.skip / (options?.limit || 10)) + 1 : 1;
  const limit = options?.limit || 10;
  const skip = options?.skip || 0;

  let query = CateringOrderModel.find(filter);
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  if (options?.sort) {
    query = query.sort(options.sort);
  }
  query = query.skip(skip).limit(limit);
  if (options?.session) {
    query = query.session(options.session);
  }

  const [data, total] = await Promise.all([
    query.exec(),
    CateringOrderModel.countDocuments(filter),
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

const updateDeliveryStatus = async ({
  id,
  status,
  options,
}: {
  id: string;
  status: DeliveryStatus;
  options?: RepositoryOptions;
}): Promise<ICateringOrder | null> => {
  return CateringOrderModel.findByIdAndUpdate(
    id,
    { deliveryStatus: status },
    { new: true, session: options?.session },
  );
};

const CateringRepository = {
  // Pack methods
  createPack,
  updatePack,
  deletePack,
  getPackById,
  getAllPacks,
  getPacksPaginated,
  getActivePacks,
  // Order methods
  createOrder,
  updateOrder,
  getOrderById,
  getOrderByPaymentId,
  getAllOrders,
  getOrdersPaginated,
  updateDeliveryStatus,
};

export default CateringRepository;
