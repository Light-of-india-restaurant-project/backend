import createError from 'http-errors';

import CateringRepository from '../../repositories/catering/catering.repository';
import { MenuItemModel } from '../../models/menu/menu.model';
import { uploadImage, deleteImage, isCloudinaryUrl, getPublicIdFromUrl } from '../../config/cloudinary.config';

import type { ICateringPack, ICateringOrder, DeliveryStatus } from '../../models/catering/catering.model';
import type { RepositoryOptions } from '../../repositories/repository.types';

// Helper to check if string is base64 image
const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/');
};

// ============ CATERING PACK SERVICE ============

interface CreatePackPayload {
  name: string;
  description: string;
  descriptionNl: string;
  category: 'vegetarian' | 'non-vegetarian' | 'mixed';
  pricePerPerson: number;
  minPeople: number;
  menuItems: string[];
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

interface UpdatePackPayload extends Partial<CreatePackPayload> {}

const createPack = async ({
  payload,
  options,
}: {
  payload: CreatePackPayload;
  options?: RepositoryOptions;
}): Promise<ICateringPack> => {
  // Validate menu items exist
  if (!payload.menuItems || payload.menuItems.length === 0) {
    throw createError(400, 'At least one menu item is required');
  }

  const menuItems = await MenuItemModel.find({
    _id: { $in: payload.menuItems },
    isActive: true,
  });

  if (menuItems.length !== payload.menuItems.length) {
    throw createError(400, 'One or more menu items are invalid or inactive');
  }

  // Handle image upload if base64
  let imageUrl = payload.image;
  if (payload.image && isBase64Image(payload.image)) {
    const uploadResult = await uploadImage(payload.image, 'catering');
    imageUrl = uploadResult.secure_url;
  }

  return CateringRepository.createPack({
    data: {
      ...payload,
      menuItems: payload.menuItems as any,
      image: imageUrl,
    } as any,
    options,
  });
};

const updatePack = async ({
  id,
  payload,
  options,
}: {
  id: string;
  payload: UpdatePackPayload;
  options?: RepositoryOptions;
}): Promise<ICateringPack> => {
  const existingPack = await CateringRepository.getPackById({ id });
  if (!existingPack) {
    throw createError(404, 'Catering pack not found');
  }

  // Validate menu items if provided
  if (payload.menuItems && payload.menuItems.length > 0) {
    const menuItems = await MenuItemModel.find({
      _id: { $in: payload.menuItems },
      isActive: true,
    });

    if (menuItems.length !== payload.menuItems.length) {
      throw createError(400, 'One or more menu items are invalid or inactive');
    }
  }

  // Handle image upload
  let imageUrl = payload.image;
  if (payload.image && isBase64Image(payload.image)) {
    // Delete old image from Cloudinary if exists
    if (existingPack.image && isCloudinaryUrl(existingPack.image)) {
      const publicId = getPublicIdFromUrl(existingPack.image);
      if (publicId) {
        await deleteImage(publicId);
      }
    }
    const uploadResult = await uploadImage(payload.image, 'catering');
    imageUrl = uploadResult.secure_url;
  }

  const updatedPack = await CateringRepository.updatePack({
    id,
    data: {
      ...payload,
      ...(payload.menuItems && { menuItems: payload.menuItems as any }),
      ...(imageUrl && { image: imageUrl }),
    } as any,
    options,
  });

  if (!updatedPack) {
    throw createError(404, 'Catering pack not found');
  }

  return updatedPack;
};

const deletePack = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ICateringPack> => {
  const pack = await CateringRepository.getPackById({ id });
  if (!pack) {
    throw createError(404, 'Catering pack not found');
  }

  // Delete image from Cloudinary if exists
  if (pack.image && isCloudinaryUrl(pack.image)) {
    const publicId = getPublicIdFromUrl(pack.image);
    if (publicId) {
      await deleteImage(publicId);
    }
  }

  const deletedPack = await CateringRepository.deletePack({ id, options });
  if (!deletedPack) {
    throw createError(404, 'Catering pack not found');
  }

  return deletedPack;
};

const getPackById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ICateringPack> => {
  const pack = await CateringRepository.getPackById({
    id,
    options: {
      ...options,
      populate: {
        path: 'menuItems',
        select: 'name description descriptionNl price isVegetarian isSpicy image',
      },
    },
  });

  if (!pack) {
    throw createError(404, 'Catering pack not found');
  }

  return pack;
};

const getAllPacks = async ({
  filter = {},
  options,
}: {
  filter?: Record<string, unknown>;
  options?: RepositoryOptions;
} = {}): Promise<ICateringPack[]> => {
  return CateringRepository.getAllPacks({
    filter,
    options: {
      ...options,
      sort: options?.sort || { sortOrder: 1, createdAt: -1 },
      populate: {
        path: 'menuItems',
        select: 'name description descriptionNl price isVegetarian isSpicy image',
      },
    },
  });
};

const getPacksPaginated = async ({
  filter = {},
  options,
}: {
  filter?: Record<string, unknown>;
  options?: RepositoryOptions;
}) => {
  return CateringRepository.getPacksPaginated({
    filter,
    options: {
      ...options,
      sort: options?.sort || { sortOrder: 1, createdAt: -1 },
      populate: {
        path: 'menuItems',
        select: 'name description descriptionNl price isVegetarian isSpicy image',
      },
    },
  });
};

const getActivePacks = async ({
  options,
}: {
  options?: RepositoryOptions;
} = {}): Promise<ICateringPack[]> => {
  return CateringRepository.getActivePacks({ options });
};

// ============ CATERING ORDER SERVICE ============

interface CreateOrderPayload {
  cateringPackId: string;
  peopleCount: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: {
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    additionalInfo?: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  paymentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
}

const createOrder = async ({
  payload,
  options,
}: {
  payload: CreateOrderPayload;
  options?: RepositoryOptions;
}): Promise<ICateringOrder> => {
  // Get the catering pack
  const pack = await CateringRepository.getPackById({ id: payload.cateringPackId });
  if (!pack) {
    throw createError(404, 'Catering pack not found');
  }

  if (!pack.isActive) {
    throw createError(400, 'This catering pack is no longer available');
  }

  // Validate people count
  if (payload.peopleCount < pack.minPeople) {
    throw createError(400, `Minimum number of people required is ${pack.minPeople}`);
  }

  // Validate delivery date is not in the past
  const deliveryDate = new Date(payload.deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (deliveryDate < today) {
    throw createError(400, 'Delivery date cannot be in the past');
  }

  // Calculate total price
  const totalPrice = payload.peopleCount * pack.pricePerPerson;

  return CateringRepository.createOrder({
    data: {
      cateringPack: pack._id as any,
      peopleCount: payload.peopleCount,
      totalPrice,
      deliveryDate,
      deliveryTime: payload.deliveryTime,
      deliveryAddress: payload.deliveryAddress,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      notes: payload.notes,
      paymentId: payload.paymentId,
      paymentStatus: payload.paymentStatus || 'pending',
      deliveryStatus: 'yet_to_be_delivered',
    } as any,
    options,
  });
};

const getOrderById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<ICateringOrder> => {
  const order = await CateringRepository.getOrderById({
    id,
    options: {
      ...options,
      populate: {
        path: 'cateringPack',
        populate: {
          path: 'menuItems',
          select: 'name description descriptionNl price isVegetarian isSpicy',
        },
      },
    },
  });

  if (!order) {
    throw createError(404, 'Catering order not found');
  }

  return order;
};

const getOrderByPaymentId = async ({
  paymentId,
  options,
}: {
  paymentId: string;
  options?: RepositoryOptions;
}): Promise<ICateringOrder | null> => {
  return CateringRepository.getOrderByPaymentId({
    paymentId,
    options: {
      ...options,
      populate: {
        path: 'cateringPack',
        populate: {
          path: 'menuItems',
          select: 'name description descriptionNl price isVegetarian isSpicy',
        },
      },
    },
  });
};

const getAllOrders = async ({
  filter = {},
  options,
}: {
  filter?: Record<string, unknown>;
  options?: RepositoryOptions;
} = {}): Promise<ICateringOrder[]> => {
  return CateringRepository.getAllOrders({
    filter,
    options: {
      ...options,
      sort: options?.sort || { createdAt: -1 },
      populate: {
        path: 'cateringPack',
        select: 'name category pricePerPerson',
      },
    },
  });
};

const getOrdersPaginated = async ({
  filter = {},
  options,
}: {
  filter?: Record<string, unknown>;
  options?: RepositoryOptions;
}) => {
  return CateringRepository.getOrdersPaginated({
    filter,
    options: {
      ...options,
      sort: options?.sort || { createdAt: -1 },
      populate: {
        path: 'cateringPack',
        select: 'name category pricePerPerson',
      },
    },
  });
};

const updateDeliveryStatus = async ({
  id,
  status,
  options,
}: {
  id: string;
  status: DeliveryStatus;
  options?: RepositoryOptions;
}): Promise<ICateringOrder> => {
  const order = await CateringRepository.getOrderById({ id });
  if (!order) {
    throw createError(404, 'Catering order not found');
  }

  // Only allow status change if payment is successful
  if (order.paymentStatus !== 'paid') {
    throw createError(400, 'Cannot update delivery status for unpaid orders');
  }

  const updatedOrder = await CateringRepository.updateDeliveryStatus({
    id,
    status,
    options,
  });

  if (!updatedOrder) {
    throw createError(404, 'Catering order not found');
  }

  return updatedOrder;
};

const updatePaymentStatus = async ({
  paymentId,
  status,
  options,
}: {
  paymentId: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  options?: RepositoryOptions;
}): Promise<ICateringOrder | null> => {
  const order = await CateringRepository.getOrderByPaymentId({ paymentId });
  if (!order) {
    return null;
  }

  return CateringRepository.updateOrder({
    id: order._id.toString(),
    data: { paymentStatus: status },
    options,
  });
};

const CateringService = {
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
  getOrderById,
  getOrderByPaymentId,
  getAllOrders,
  getOrdersPaginated,
  updateDeliveryStatus,
  updatePaymentStatus,
};

export default CateringService;
