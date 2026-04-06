import { OrderModel } from '../../models/order/order.model';

import type { IOrder, OrderStatus } from '../../models/order/order.model';
import type { RepositoryOptions } from '../repository.types';

interface OrderQueryOptions extends RepositoryOptions {
  userId?: string;
  status?: OrderStatus | OrderStatus[];
  startDate?: Date;
  endDate?: Date;
  visitedByAdmin?: boolean;
}

const createOrder = async ({ data, options }: { data: Partial<IOrder>; options?: RepositoryOptions }): Promise<IOrder> => {
  return OrderModel.create([data], options?.session ? { session: options.session } : undefined).then((res) => res[0]);
};

const updateOrder = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IOrder>;
  options?: RepositoryOptions;
}): Promise<IOrder | null> => {
  return OrderModel.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

const deleteOrder = async ({ id, options }: { id: string; options?: RepositoryOptions }): Promise<IOrder | null> => {
  return OrderModel.findByIdAndDelete(id, { session: options?.session });
};

const getOrderById = async ({ id, options }: { id: string; options?: RepositoryOptions }): Promise<IOrder | null> => {
  let query = OrderModel.findById(id, undefined, { session: options?.session });
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  return query.exec();
};

const getOrderByOrderNumber = async ({
  orderNumber,
  options,
}: {
  orderNumber: string;
  options?: RepositoryOptions;
}): Promise<IOrder | null> => {
  let query = OrderModel.findOne({ orderNumber }, undefined, { session: options?.session });
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  return query.exec();
};

const getOrdersByUserId = async ({ userId, options }: { userId: string; options?: RepositoryOptions }): Promise<IOrder[]> => {
  let query = OrderModel.find({ userId }, undefined, { session: options?.session }).sort({ createdAt: -1 });

  if (options?.skip) {
    query = query.skip(options.skip);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  return query.exec();
};

const getAllOrders = async ({ options }: { options?: OrderQueryOptions } = {}): Promise<IOrder[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (options?.userId) {
    filter.userId = options.userId;
  }

  if (options?.status) {
    if (Array.isArray(options.status)) {
      filter.status = { $in: options.status };
    } else {
      filter.status = options.status;
    }
  }

  if (options?.startDate || options?.endDate) {
    filter.createdAt = {};
    if (options?.startDate) {
      filter.createdAt.$gte = options.startDate;
    }
    if (options?.endDate) {
      filter.createdAt.$lte = options.endDate;
    }
  }

  let query = OrderModel.find(filter, undefined, { session: options?.session }).sort(options?.sort || { createdAt: -1 });

  if (options?.skip) {
    query = query.skip(options.skip);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  return query.exec();
};

const countOrders = async ({ options }: { options?: OrderQueryOptions } = {}): Promise<number> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (options?.userId) {
    filter.userId = options.userId;
  }

  if (options?.status) {
    if (Array.isArray(options.status)) {
      filter.status = { $in: options.status };
    } else {
      filter.status = options.status;
    }
  }

  if (options?.startDate || options?.endDate) {
    filter.createdAt = {};
    if (options?.startDate) {
      filter.createdAt.$gte = options.startDate;
    }
    if (options?.endDate) {
      filter.createdAt.$lte = options.endDate;
    }
  }

  if (options?.visitedByAdmin !== undefined) {
    filter.visitedByAdmin = options.visitedByAdmin;
  }

  return OrderModel.countDocuments(filter).exec();
};

const findOne = async ({ condition, options }: { condition: object; options?: RepositoryOptions }): Promise<IOrder | null> => {
  let query = OrderModel.findOne(condition, undefined, { session: options?.session });
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  return query.exec();
};

const OrderRepository = {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
  getOrderByOrderNumber,
  getOrdersByUserId,
  getAllOrders,
  countOrders,
  findOne,
};

export default OrderRepository;
