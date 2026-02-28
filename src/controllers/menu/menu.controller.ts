import { DynamicMessages } from '../../constant/error';
import MenuService from '../../services/menu/menu.service';

import type { Request, Response, NextFunction } from 'express';
import type { MenuType } from '../../models/menu/menu.model';

// ==================== Public Endpoints ====================

const getMenuDineIn = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const menu = await MenuService.getMenuByType({ menuType: 'dine-in' });
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

const getMenuTakeaway = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const menu = await MenuService.getMenuByType({ menuType: 'takeaway' });
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

// ==================== Admin - Categories ====================

const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await MenuService.createCategory({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('Category'),
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const category = await MenuService.updateCategory({
      id,
      payload: req.body,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Category'),
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await MenuService.deleteCategory({ id });
    res.status(200).json({
      message: DynamicMessages.deleteMessage('Category'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const category = await MenuService.getCategoryById({ id });
    res.status(200).json({
      message: DynamicMessages.fetched('Category'),
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isActive, page, limit } = req.query;
    const result = await MenuService.getAllCategoriesAdmin({
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.status(200).json({
      message: DynamicMessages.fetched('Categories'),
      success: true,
      categories: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== Admin - Items ====================

const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await MenuService.createItem({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('Menu Item'),
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const item = await MenuService.updateItem({
      id,
      payload: req.body,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Menu Item'),
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await MenuService.deleteItem({ id });
    res.status(200).json({
      message: DynamicMessages.deleteMessage('Menu Item'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await MenuService.getItemById({ id: req.params.id as string });
    res.status(200).json({
      message: DynamicMessages.fetched('Menu Item'),
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

const getAllItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { menuType, category, search, isActive, isVegetarian, isSpicy, isDoubleSpicy, page, limit } = req.query;
    const result = await MenuService.getAllItemsAdmin({
      menuType: menuType as MenuType,
      category: category as string,
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isVegetarian: isVegetarian === 'true' ? true : isVegetarian === 'false' ? false : undefined,
      isSpicy: isSpicy === 'true' ? true : isSpicy === 'false' ? false : undefined,
      isDoubleSpicy: isDoubleSpicy === 'true' ? true : isDoubleSpicy === 'false' ? false : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.status(200).json({
      message: DynamicMessages.fetched('Menu Items'),
      success: true,
      items: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const MenuController = {
  // Public
  getMenuDineIn,
  getMenuTakeaway,
  // Admin - Categories
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
  // Admin - Items
  createItem,
  updateItem,
  deleteItem,
  getItemById,
  getAllItems,
};

export default MenuController;
