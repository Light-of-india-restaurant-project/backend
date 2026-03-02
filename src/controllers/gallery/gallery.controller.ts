import { DynamicMessages } from '../../constant/error';
import GalleryService from '../../services/gallery/gallery.service';

import type { Request, Response, NextFunction } from 'express';

// ==================== Public Endpoints ====================

// Get active gallery images (public)
const getActive = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const images = await GalleryService.getActive();
    res.status(200).json({
      success: true,
      images,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== Admin Endpoints ====================

// Get all gallery images (admin)
const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const images = await GalleryService.getAll();
    res.status(200).json({
      message: DynamicMessages.fetched('Gallery images'),
      success: true,
      images,
    });
  } catch (error) {
    next(error);
  }
};

// Get gallery image by ID
const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const image = await GalleryService.getById({ id });
    res.status(200).json({
      message: DynamicMessages.fetched('Gallery image'),
      success: true,
      image,
    });
  } catch (error) {
    next(error);
  }
};

// Create gallery image
const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const image = await GalleryService.create({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('Gallery image'),
      success: true,
      image,
    });
  } catch (error) {
    next(error);
  }
};

// Update gallery image
const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const image = await GalleryService.update({ id, payload: req.body });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Gallery image'),
      success: true,
      image,
    });
  } catch (error) {
    next(error);
  }
};

// Delete gallery image
const deleteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await GalleryService.deleteById({ id });
    res.status(200).json({
      message: DynamicMessages.deleteMessage('Gallery image'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Set featured image for a section
const setFeatured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, section } = req.body;
    const image = await GalleryService.setFeatured({ id, section });
    res.status(200).json({
      message: 'Featured image updated successfully',
      success: true,
      image,
    });
  } catch (error) {
    next(error);
  }
};

const GalleryController = {
  getActive,
  getAll,
  getById,
  create,
  update,
  deleteById,
  setFeatured,
};

export default GalleryController;
