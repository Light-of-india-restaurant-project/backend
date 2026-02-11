import { MenuCategoryModel, MenuItemModel } from '../../models/menu/menu.model';

import type { IMenuCategory, IMenuItem } from '../../models/menu/menu.model';
import type { RepositoryOptions } from '../repository.types';

// ==================== Category Repository ====================

const createCategory = async ({
  data,
  options,
}: {
  data: Partial<IMenuCategory>;
  options?: RepositoryOptions;
}): Promise<IMenuCategory> => {
  const result = await MenuCategoryModel.create([data], options?.session ? { session: options.session } : undefined);
  return result[0];
};

const updateCategory = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IMenuCategory>;
  options?: RepositoryOptions;
}): Promise<IMenuCategory | null> => {
  return MenuCategoryModel.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

const deleteCategory = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IMenuCategory | null> => {
  return MenuCategoryModel.findByIdAndDelete(id, { session: options?.session });
};

const getCategoryById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IMenuCategory | null> => {
  return MenuCategoryModel.findById(id, undefined, { session: options?.session });
};

const getAllCategories = async ({
  condition = {},
  options,
}: { condition?: object; options?: RepositoryOptions } = {}): Promise<IMenuCategory[]> => {
  let query = MenuCategoryModel.find(condition, undefined, { session: options?.session });
  if (options?.sort) query = query.sort(options.sort);
  return query.exec();
};

// ==================== Item Repository ====================

const createItem = async ({
  data,
  options,
}: {
  data: Partial<IMenuItem>;
  options?: RepositoryOptions;
}): Promise<IMenuItem> => {
  const result = await MenuItemModel.create([data], options?.session ? { session: options.session } : undefined);
  return result[0];
};

const updateItem = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IMenuItem>;
  options?: RepositoryOptions;
}): Promise<IMenuItem | null> => {
  return MenuItemModel.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

const deleteItem = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IMenuItem | null> => {
  return MenuItemModel.findByIdAndDelete(id, { session: options?.session });
};

const getItemById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IMenuItem | null> => {
  let query = MenuItemModel.findById(id, undefined, { session: options?.session });
  if (options?.populate) query = query.populate(options.populate);
  return query.exec();
};

const getAllItems = async ({
  condition = {},
  options,
}: { condition?: object; options?: RepositoryOptions } = {}): Promise<IMenuItem[]> => {
  let query = MenuItemModel.find(condition, undefined, { session: options?.session });
  if (options?.populate) query = query.populate(options.populate);
  if (options?.sort) query = query.sort(options.sort);
  return query.exec();
};

const MenuRepository = {
  // Categories
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
  // Items
  createItem,
  updateItem,
  deleteItem,
  getItemById,
  getAllItems,
};

export default MenuRepository;
