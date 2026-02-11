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
    const category = await MenuService.updateCategory({
      id: req.params.id,
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
    await MenuService.deleteCategory({ id: req.params.id });
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
    const category = await MenuService.getCategoryById({ id: req.params.id });
    res.status(200).json({
      message: DynamicMessages.fetched('Category'),
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await MenuService.getAllCategoriesAdmin();
    res.status(200).json({
      message: DynamicMessages.fetched('Categories'),
      success: true,
      categories,
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
    const item = await MenuService.updateItem({
      id: req.params.id,
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
    await MenuService.deleteItem({ id: req.params.id });
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
    const item = await MenuService.getItemById({ id: req.params.id });
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
    const { menuType, category } = req.query;
    const items = await MenuService.getAllItemsAdmin({
      menuType: menuType as MenuType,
      category: category as string,
    });
    res.status(200).json({
      message: DynamicMessages.fetched('Menu Items'),
      success: true,
      items,
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
