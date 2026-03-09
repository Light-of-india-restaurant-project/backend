import { DynamicMessages } from '../../constant/error';
import OfferService from '../../services/offer/offer.service';

import type { Request, Response, NextFunction } from 'express';

// ==================== Public Endpoints ====================

const getActiveOffers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offers = await OfferService.getActiveOffers();
    res.status(200).json({
      message: DynamicMessages.fetched('Offers'),
      success: true,
      offers,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== Admin Endpoints ====================

const getAllOffers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isActive, page, limit } = req.query;
    const result = await OfferService.getAllOffersAdmin({
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.status(200).json({
      message: DynamicMessages.fetched('Offers'),
      success: true,
      offers: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getOfferById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const offer = await OfferService.getOfferById({ id });
    res.status(200).json({
      message: DynamicMessages.fetched('Offer'),
      success: true,
      offer,
    });
  } catch (error) {
    next(error);
  }
};

const createOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offer = await OfferService.createOffer({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('Offer'),
      success: true,
      offer,
    });
  } catch (error) {
    next(error);
  }
};

const updateOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const offer = await OfferService.updateOffer({
      id,
      payload: req.body,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Offer'),
      success: true,
      offer,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOffer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await OfferService.deleteOffer({ id });
    res.status(200).json({
      message: DynamicMessages.deleteMessage('Offer'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const OfferController = {
  // Public
  getActiveOffers,
  // Admin
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};

export default OfferController;
