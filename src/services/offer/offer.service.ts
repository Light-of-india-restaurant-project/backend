/* eslint-disable @typescript-eslint/no-explicit-any */

import { DynamicMessages } from '../../constant/error';
import { OfferModel } from '../../models/offer/offer.model';
import createError from '../../utils/http.error';

import type { IOffer } from '../../models/offer/offer.model';

interface CreateOfferPayload {
  name: string;
  description: string;
  descriptionNl: string;
  price: number;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  validFrom?: string;
  validUntil?: string;
}

interface UpdateOfferPayload {
  name?: string;
  description?: string;
  descriptionNl?: string;
  price?: number;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  validFrom?: string;
  validUntil?: string;
}

interface OfferQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Get all active offers (public endpoint)
const getActiveOffers = async (): Promise<IOffer[]> => {
  const now = new Date();
  
  const offers = await OfferModel.find({
    isActive: true,
    $or: [
      { validFrom: { $exists: false }, validUntil: { $exists: false } },
      { validFrom: { $lte: now }, validUntil: { $exists: false } },
      { validFrom: { $exists: false }, validUntil: { $gte: now } },
      { validFrom: { $lte: now }, validUntil: { $gte: now } },
    ],
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return offers as any;
};

// Get all offers (admin endpoint with pagination)
const getAllOffersAdmin = async ({
  search,
  isActive,
  page = 1,
  limit = 20,
}: OfferQueryParams): Promise<{
  data: IOffer[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> => {
  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { descriptionNl: { $regex: search, $options: 'i' } },
    ];
  }

  if (typeof isActive === 'boolean') {
    query.isActive = isActive;
  }

  const skip = (page - 1) * limit;

  const [offers, total] = await Promise.all([
    OfferModel.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    OfferModel.countDocuments(query),
  ]);

  return {
    data: offers as any,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get offer by ID
const getOfferById = async ({ id }: { id: string }): Promise<IOffer> => {
  const offer = await OfferModel.findById(id).lean();

  if (!offer) {
    throw createError(404, DynamicMessages.notFoundMessage('Offer'));
  }

  return offer as any;
};

// Create offer (admin)
const createOffer = async ({ payload }: { payload: CreateOfferPayload }): Promise<IOffer> => {
  const offerData: Partial<IOffer> = {
    name: payload.name,
    description: payload.description,
    descriptionNl: payload.descriptionNl,
    price: payload.price,
    image: payload.image,
    isActive: payload.isActive ?? true,
    sortOrder: payload.sortOrder ?? 0,
  };

  if (payload.validFrom) {
    offerData.validFrom = new Date(payload.validFrom);
  }

  if (payload.validUntil) {
    offerData.validUntil = new Date(payload.validUntil);
  }

  const offer = await OfferModel.create(offerData);
  return offer;
};

// Update offer (admin)
const updateOffer = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateOfferPayload;
}): Promise<IOffer> => {
  const offer = await OfferModel.findById(id);

  if (!offer) {
    throw createError(404, DynamicMessages.notFoundMessage('Offer'));
  }

  if (payload.name !== undefined) offer.name = payload.name;
  if (payload.description !== undefined) offer.description = payload.description;
  if (payload.descriptionNl !== undefined) offer.descriptionNl = payload.descriptionNl;
  if (payload.price !== undefined) offer.price = payload.price;
  if (payload.image !== undefined) offer.image = payload.image;
  if (payload.isActive !== undefined) offer.isActive = payload.isActive;
  if (payload.sortOrder !== undefined) offer.sortOrder = payload.sortOrder;
  if (payload.validFrom !== undefined) offer.validFrom = payload.validFrom ? new Date(payload.validFrom) : undefined;
  if (payload.validUntil !== undefined) offer.validUntil = payload.validUntil ? new Date(payload.validUntil) : undefined;

  await offer.save();
  return offer.toObject();
};

// Delete offer (admin)
const deleteOffer = async ({ id }: { id: string }): Promise<void> => {
  const offer = await OfferModel.findById(id);

  if (!offer) {
    throw createError(404, DynamicMessages.notFoundMessage('Offer'));
  }

  await offer.deleteOne();
};

const OfferService = {
  getActiveOffers,
  getAllOffersAdmin,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};

export default OfferService;
