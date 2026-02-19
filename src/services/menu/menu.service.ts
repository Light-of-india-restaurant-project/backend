import { DynamicMessages } from '../../constant/error';
import MenuRepository from '../../repositories/menu/menu.repository';
import createError from '../../utils/http.error';

import type { IMenuCategory, IMenuItem, MenuType } from '../../models/menu/menu.model';
import type { Document } from 'mongoose';

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CategoryQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface ItemQueryParams {
  search?: string;
  menuType?: MenuType;
  category?: string;
  isActive?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isDoubleSpicy?: boolean;
  page?: number;
  limit?: number;
}

// ==================== Category Services ====================

const createCategory = async ({ payload }: { payload: Partial<IMenuCategory> }): Promise<IMenuCategory> => {
  return MenuRepository.createCategory({ data: payload });
};

const updateCategory = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<IMenuCategory>;
}): Promise<IMenuCategory> => {
  const category = await MenuRepository.updateCategory({ id, data: payload });
  if (!category) {
    throw createError(404, DynamicMessages.notFoundMessage('Category'));
  }
  return category;
};

const deleteCategory = async ({ id }: { id: string }): Promise<void> => {
  // Check if category has items
  const items = await MenuRepository.getAllItems({ condition: { category: id } });
  if (items.length > 0) {
    throw createError(400, 'Cannot delete category with existing menu items. Delete the items first.');
  }

  const category = await MenuRepository.deleteCategory({ id });
  if (!category) {
    throw createError(404, DynamicMessages.notFoundMessage('Category'));
  }
};

const getCategoryById = async ({ id }: { id: string }): Promise<IMenuCategory> => {
  const category = await MenuRepository.getCategoryById({ id });
  if (!category) {
    throw createError(404, DynamicMessages.notFoundMessage('Category'));
  }
  return category;
};

const getAllCategories = async (): Promise<IMenuCategory[]> => {
  return MenuRepository.getAllCategories({
    condition: { isActive: true },
    options: { sort: { sortOrder: 1, createdAt: 1 } },
  });
};

const getAllCategoriesAdmin = async (params: CategoryQueryParams = {}): Promise<PaginatedResult<IMenuCategory>> => {
  const { search, isActive, page = 1, limit = 20 } = params;
  
  const condition: Record<string, unknown> = {};
  if (typeof isActive === 'boolean') {
    condition.isActive = isActive;
  }

  return MenuRepository.getCategoriesPaginated({
    condition,
    options: {
      page,
      limit,
      search,
      searchFields: ['name'],
      sort: { sortOrder: 1, createdAt: 1 },
    },
  });
};

// ==================== Item Services ====================

const createItem = async ({ payload }: { payload: Partial<IMenuItem> }): Promise<IMenuItem> => {
  // Verify category exists
  const category = await MenuRepository.getCategoryById({ id: payload.category as unknown as string });
  if (!category) {
    throw createError(404, DynamicMessages.notFoundMessage('Category'));
  }
  return MenuRepository.createItem({ data: payload });
};

const updateItem = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<IMenuItem>;
}): Promise<IMenuItem> => {
  // If category is being updated, verify it exists
  if (payload.category) {
    const category = await MenuRepository.getCategoryById({ id: payload.category as unknown as string });
    if (!category) {
      throw createError(404, DynamicMessages.notFoundMessage('Category'));
    }
  }

  const item = await MenuRepository.updateItem({ id, data: payload });
  if (!item) {
    throw createError(404, DynamicMessages.notFoundMessage('Menu Item'));
  }
  return item;
};

const deleteItem = async ({ id }: { id: string }): Promise<void> => {
  const item = await MenuRepository.deleteItem({ id });
  if (!item) {
    throw createError(404, DynamicMessages.notFoundMessage('Menu Item'));
  }
};

const getItemById = async ({ id }: { id: string }): Promise<IMenuItem> => {
  const item = await MenuRepository.getItemById({ id, options: { populate: 'category' } });
  if (!item) {
    throw createError(404, DynamicMessages.notFoundMessage('Menu Item'));
  }
  return item;
};

const getAllItems = async ({
  menuType,
  category,
}: {
  menuType?: MenuType;
  category?: string;
}): Promise<IMenuItem[]> => {
  const condition: Record<string, unknown> = {};

  if (menuType && menuType !== 'both') {
    condition.$or = [{ menuType }, { menuType: 'both' }];
  }

  if (category) {
    condition.category = category;
  }

  return MenuRepository.getAllItems({
    condition,
    options: { sort: { sortOrder: 1, createdAt: 1 }, populate: 'category' },
  });
};

const getAllItemsAdmin = async (params: ItemQueryParams = {}): Promise<PaginatedResult<IMenuItem>> => {
  const { search, menuType, category, isActive, isVegetarian, isSpicy, page = 1, limit = 20 } = params;
  
  const condition: Record<string, unknown> = {};

  if (menuType) {
    if (menuType === 'both') {
      condition.menuType = 'both';
    } else {
      condition.$or = [{ menuType }, { menuType: 'both' }];
    }
  }

  if (category) {
    condition.category = category;
  }

  if (typeof isActive === 'boolean') {
    condition.isActive = isActive;
  }

  if (typeof isVegetarian === 'boolean') {
    condition.isVegetarian = isVegetarian;
  }

  if (typeof isSpicy === 'boolean') {
    condition.isSpicy = isSpicy;
  }

  if (typeof params.isDoubleSpicy === 'boolean') {
    condition.isDoubleSpicy = params.isDoubleSpicy;
  }

  return MenuRepository.getItemsPaginated({
    condition,
    options: {
      page,
      limit,
      search,
      searchFields: ['name', 'description'],
      sort: { sortOrder: 1, createdAt: 1 },
      populate: 'category',
    },
  });
};

// ==================== Public Menu Services ====================

const getMenuByType = async ({
  menuType,
}: {
  menuType: 'takeaway' | 'dine-in';
}): Promise<{ categories: Array<Record<string, unknown> & { items: IMenuItem[] }> }> => {
  // Get all active categories
  const categories = await MenuRepository.getAllCategories({
    condition: { isActive: true },
    options: { sort: { sortOrder: 1 } },
  });

  // Get items for each category
  const result = await Promise.all(
    categories.map(async (cat) => {
      const catDoc = cat as unknown as Document;
      const items = await MenuRepository.getAllItems({
        condition: {
          category: catDoc._id,
          isActive: true,
          $or: [{ menuType }, { menuType: 'both' }],
        },
        options: { sort: { sortOrder: 1 } },
      });

      return {
        ...(catDoc.toJSON ? catDoc.toJSON() : cat),
        items,
      };
    }),
  );

  // Filter out categories with no items
  const categoriesWithItems = result.filter((cat) => cat.items.length > 0);

  return { categories: categoriesWithItems };
};

const MenuService = {
  // Categories
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
  getAllCategoriesAdmin,
  // Items
  createItem,
  updateItem,
  deleteItem,
  getItemById,
  getAllItems,
  getAllItemsAdmin,
  // Public
  getMenuByType,
};

export default MenuService;
