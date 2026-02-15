import { Router } from 'express';

import { ReservationController } from '../../controllers/reservation/reservation.controller';
import { TableController } from '../../controllers/reservation/table.controller';
import { RestaurantSettingsController } from '../../controllers/reservation/restaurant-settings.controller';
import { adminAuthMiddleware, authenticationMiddleware } from '../../middleware/auth.middleware';
import { validateRequestBody, validateRequestParams, validateRequestQuery } from '../../middleware/validation.middleware';
import CommonValidator from '../../validators/common.validators';
import ReservationValidator from '../../validators/reservation.validator';
import RestaurantSettingsValidator from '../../validators/restaurant-settings.validator';

const reservationRouter = Router();

// ==================== Public Routes ====================

// Get available time slots for a date
reservationRouter.get(
  '/available-slots',
  validateRequestQuery(ReservationValidator.availableSlotsQuerySchema),
  ReservationController.getAvailableSlots,
);

// Create a new reservation (public, optionally authenticated)
reservationRouter.post(
  '/',
  validateRequestBody(ReservationValidator.reservationCreateSchema),
  ReservationController.create,
);

// Get reservation by confirmation code
reservationRouter.get('/code/:confirmationCode', ReservationController.getByConfirmationCode);

// Cancel reservation by confirmation code
reservationRouter.post('/code/:confirmationCode/cancel', ReservationController.cancelByConfirmationCode);

// Get restaurant settings (public - for displaying operating hours)
reservationRouter.get('/settings', RestaurantSettingsController.get);

// ==================== User Routes (Authenticated) ====================

// Get user's reservations
reservationRouter.get('/my', authenticationMiddleware, ReservationController.getMyReservations);

// ==================== Admin - Table Routes ====================

// Get all tables (paginated, for admin)
reservationRouter.get('/admin/tables', adminAuthMiddleware, TableController.getPaginated);

// Get table by ID
reservationRouter.get(
  '/admin/tables/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  TableController.getById,
);

// Create table
reservationRouter.post(
  '/admin/tables',
  adminAuthMiddleware,
  validateRequestBody(ReservationValidator.tableCreateSchema),
  TableController.create,
);

// Update table
reservationRouter.patch(
  '/admin/tables/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(ReservationValidator.tableUpdateSchema),
  TableController.update,
);

// Delete table
reservationRouter.delete(
  '/admin/tables/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  TableController.remove,
);

// ==================== Admin - Reservation Routes ====================

// Get all reservations (paginated)
reservationRouter.get('/admin', adminAuthMiddleware, ReservationController.getPaginated);

// Get reservation by ID
reservationRouter.get(
  '/admin/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  ReservationController.getById,
);

// Update reservation
reservationRouter.patch(
  '/admin/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(ReservationValidator.reservationUpdateSchema),
  ReservationController.update,
);

// Update reservation status
reservationRouter.patch(
  '/admin/:id/status',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(ReservationValidator.reservationStatusUpdateSchema),
  ReservationController.updateStatus,
);

// Confirm reservation
reservationRouter.post(
  '/admin/:id/confirm',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  ReservationController.confirm,
);

// Cancel reservation
reservationRouter.post(
  '/admin/:id/cancel',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  ReservationController.cancel,
);

// Mark as completed
reservationRouter.post(
  '/admin/:id/complete',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  ReservationController.complete,
);

// Mark as no-show
reservationRouter.post(
  '/admin/:id/no-show',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  ReservationController.markNoShow,
);

// Delete reservation
reservationRouter.delete(
  '/admin/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  ReservationController.remove,
);

// ==================== Admin - Settings Routes ====================

// Update all settings
reservationRouter.put(
  '/admin/settings',
  adminAuthMiddleware,
  validateRequestBody(RestaurantSettingsValidator.settingsUpdateSchema),
  RestaurantSettingsController.update,
);

// Update operating hours only
reservationRouter.patch(
  '/admin/settings/operating-hours',
  adminAuthMiddleware,
  validateRequestBody(RestaurantSettingsValidator.operatingHoursUpdateSchema),
  RestaurantSettingsController.updateOperatingHours,
);

// Update reservation settings only
reservationRouter.patch(
  '/admin/settings/reservation',
  adminAuthMiddleware,
  validateRequestBody(RestaurantSettingsValidator.reservationSettingsUpdateSchema),
  RestaurantSettingsController.updateReservationSettings,
);

export default reservationRouter;
