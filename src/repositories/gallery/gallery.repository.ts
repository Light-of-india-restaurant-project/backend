import GalleryImage from '../../models/gallery/gallery.model';

import type { IGalleryImage, GallerySection } from '../../models/gallery/gallery.model';
import type { RepositoryOptions } from '../repository.types';

// Create gallery image
const create = async ({
  data,
  options,
}: {
  data: Partial<IGalleryImage>;
  options?: RepositoryOptions;
}): Promise<IGalleryImage> => {
  const result = await GalleryImage.create([data], options?.session ? { session: options.session } : undefined);
  return result[0];
};

// Update gallery image
const update = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IGalleryImage>;
  options?: RepositoryOptions;
}): Promise<IGalleryImage | null> => {
  return GalleryImage.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

// Delete gallery image
const deleteById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IGalleryImage | null> => {
  return GalleryImage.findByIdAndDelete(id, { session: options?.session });
};

// Get gallery image by ID
const getById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IGalleryImage | null> => {
  return GalleryImage.findById(id, undefined, { session: options?.session });
};

// Get all gallery images (sorted by section and sortOrder)
const getAll = async ({
  condition = {},
  options,
}: { condition?: object; options?: RepositoryOptions } = {}): Promise<IGalleryImage[]> => {
  let query = GalleryImage.find(condition, undefined, { session: options?.session });
  query = query.sort({ section: 1, isFeatured: -1, sortOrder: 1 });
  return query.exec();
};

// Get active gallery images for public display (grouped by section)
const getActive = async (): Promise<IGalleryImage[]> => {
  return GalleryImage.find({ isActive: true }).sort({ section: 1, isFeatured: -1, sortOrder: 1 }).exec();
};

// Get images by section
const getBySection = async ({
  section,
  options,
}: {
  section: GallerySection;
  options?: RepositoryOptions;
}): Promise<IGalleryImage[]> => {
  return GalleryImage.find({ section }, undefined, { session: options?.session })
    .sort({ isFeatured: -1, sortOrder: 1 })
    .exec();
};

// Get featured image by section
const getFeaturedBySection = async ({
  section,
  options,
}: {
  section: GallerySection;
  options?: RepositoryOptions;
}): Promise<IGalleryImage | null> => {
  return GalleryImage.findOne({ section, isFeatured: true }, undefined, { session: options?.session });
};

// Clear featured status for a section
const clearFeaturedBySection = async ({
  section,
  options,
}: {
  section: GallerySection;
  options?: RepositoryOptions;
}): Promise<void> => {
  await GalleryImage.updateMany({ section, isFeatured: true }, { isFeatured: false }, { session: options?.session });
};

const GalleryRepository = {
  create,
  update,
  deleteById,
  getById,
  getAll,
  getActive,
  getBySection,
  getFeaturedBySection,
  clearFeaturedBySection,
};

export default GalleryRepository;
