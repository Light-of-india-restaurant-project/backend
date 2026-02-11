import { Router } from 'express';

import MenuController from '../../controllers/menu/menu.controller';
import { validateRequestBody, validateRequestParams } from '../../middleware/validation.middleware';
import CommonValidator from '../../validators/common.validators';
import MenuValidator from '../../validators/menu.validator';

const menuRouter = Router();

// ==================== Public Routes ====================
menuRouter.get('/dine-in', MenuController.getMenuDineIn);
menuRouter.get('/takeaway', MenuController.getMenuTakeaway);

// ==================== Admin - Category Routes ====================
menuRouter.get('/categories', MenuController.getAllCategories);
menuRouter.get(
  '/categories/:id',
  validateRequestParams(CommonValidator.paramsValidationSchema),
  MenuController.getCategoryById,
);
menuRouter.post(
  '/categories',
  validateRequestBody(MenuValidator.categoryCreateSchema),
  MenuController.createCategory,
);
menuRouter.put(
  '/categories/:id',
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(MenuValidator.categoryUpdateSchema),
  MenuController.updateCategory,
);
menuRouter.delete(
  '/categories/:id',
  validateRequestParams(CommonValidator.paramsValidationSchema),
  MenuController.deleteCategory,
);

// ==================== Admin - Item Routes ====================
menuRouter.get('/items', MenuController.getAllItems);
menuRouter.get(
  '/items/:id',
  validateRequestParams(CommonValidator.paramsValidationSchema),
  MenuController.getItemById,
);
menuRouter.post('/items', validateRequestBody(MenuValidator.itemCreateSchema), MenuController.createItem);
menuRouter.put(
  '/items/:id',
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(MenuValidator.itemUpdateSchema),
  MenuController.updateItem,
);
menuRouter.delete(
  '/items/:id',
  validateRequestParams(CommonValidator.paramsValidationSchema),
  MenuController.deleteItem,
);

export default menuRouter;
