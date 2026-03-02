import { DynamicMessages } from '../../constant/error';
import GalleryRepository from '../../repositories/gallery/gallery.repository';
import createError from '../../utils/http.error';
import { uploadImage, deleteImage, isCloudinaryUrl, getPublicIdFromUrl } from '../../config/cloudinary.config';

import type { IGalleryImage, GalleryCategory, GallerySection } from '../../models/gallery/gallery.model';

interface CreateGalleryPayload {
  title: string;
  titleNl: string;
  alt: string;
  altNl: string;
  category: GalleryCategory;
  imageUrl: string;
  section: GallerySection;
  isFeatured?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

interface UpdateGalleryPayload {
  title?: string;
  titleNl?: string;
  alt?: string;
  altNl?: string;
  category?: GalleryCategory;
  imageUrl?: string;
  section?: GallerySection;
  isFeatured?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

// Helper to check if string is base64 image
const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/');
};

// Create gallery image
const create = async ({ payload }: { payload: CreateGalleryPayload }): Promise<IGalleryImage> => {
  // If setting as featured, clear other featured images in same section
  if (payload.isFeatured) {
    await GalleryRepository.clearFeaturedBySection({ section: payload.section });
  }

  // Upload to Cloudinary if base64 image
  if (isBase64Image(payload.imageUrl)) {
    const uploadResult = await uploadImage(payload.imageUrl, 'gallery');
    payload.imageUrl = uploadResult.secure_url;
  }

  return GalleryRepository.create({ data: payload });
};

// Update gallery image
const update = async ({ id, payload }: { id: string; payload: UpdateGalleryPayload }): Promise<IGalleryImage> => {
  const existingImage = await GalleryRepository.getById({ id });
  if (!existingImage) {
    throw createError(404, DynamicMessages.notFoundMessage('Gallery image'));
  }

  // If setting as featured, clear other featured images in the section
  if (payload.isFeatured) {
    const section = payload.section || existingImage.section;
    await GalleryRepository.clearFeaturedBySection({ section });
  }

  // If new image is being uploaded (base64), upload to Cloudinary and delete old one
  if (payload.imageUrl && isBase64Image(payload.imageUrl)) {
    const uploadResult = await uploadImage(payload.imageUrl, 'gallery');
    payload.imageUrl = uploadResult.secure_url;
    
    // Delete old image from Cloudinary if it was stored there
    if (isCloudinaryUrl(existingImage.imageUrl)) {
      const publicId = getPublicIdFromUrl(existingImage.imageUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
    }
  }

  const image = await GalleryRepository.update({ id, data: payload });
  if (!image) {
    throw createError(404, DynamicMessages.notFoundMessage('Gallery image'));
  }
  return image;
};

// Delete gallery image
const deleteById = async ({ id }: { id: string }): Promise<void> => {
  const existingImage = await GalleryRepository.getById({ id });
  if (!existingImage) {
    throw createError(404, DynamicMessages.notFoundMessage('Gallery image'));
  }
  
  // Delete from Cloudinary if stored there
  if (isCloudinaryUrl(existingImage.imageUrl)) {
    const publicId = getPublicIdFromUrl(existingImage.imageUrl);
    if (publicId) {
      await deleteImage(publicId);
    }
  }

  const image = await GalleryRepository.deleteById({ id });
  if (!image) {
    throw createError(404, DynamicMessages.notFoundMessage('Gallery image'));
  }
};

// Get gallery image by ID
const getById = async ({ id }: { id: string }): Promise<IGalleryImage> => {
  const image = await GalleryRepository.getById({ id });
  if (!image) {
    throw createError(404, DynamicMessages.notFoundMessage('Gallery image'));
  }
  return image;
};

// Get all gallery images (admin)
const getAll = async (): Promise<IGalleryImage[]> => {
  return GalleryRepository.getAll();
};

// Get active gallery images (public)
const getActive = async (): Promise<IGalleryImage[]> => {
  return GalleryRepository.getActive();
};

// Set featured image for a section
const setFeatured = async ({ id, section }: { id: string; section: GallerySection }): Promise<IGalleryImage> => {
  const image = await GalleryRepository.getById({ id });
  if (!image) {
    throw createError(404, DynamicMessages.notFoundMessage('Gallery image'));
  }

  // Clear existing featured for this section
  await GalleryRepository.clearFeaturedBySection({ section });

  // Set new featured
  const updated = await GalleryRepository.update({ id, data: { isFeatured: true, section } });
  if (!updated) {
    throw createError(500, 'Failed to update featured image');
  }
  return updated;
};

const GalleryService = {
  create,
  update,
  deleteById,
  getById,
  getAll,
  getActive,
  setFeatured,
};

export default GalleryService;
