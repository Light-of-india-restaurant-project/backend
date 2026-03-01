import { Router } from 'express';

import { ReservationController } from '../../controllers/reservation/reservation.controller';
import { SimpleReservationController } from '../../controllers/reservation/simple-reservation.controller';
import { TableController } from '../../controllers/reservation/table.controller';
import { FloorController } from '../../controllers/reservation/floor.controller';
import { RowController } from '../../controllers/reservation/row.controller';
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

// ==================== Admin - Floor Routes ====================

// Get all floors (paginated, for admin)
reservationRouter.get('/admin/floors', adminAuthMiddleware, FloorController.getPaginated);

// Get floor by ID
reservationRouter.get(
  '/admin/floors/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  FloorController.getById,
);

// Create floor
reservationRouter.post(
  '/admin/floors',
  adminAuthMiddleware,
  validateRequestBody(ReservationValidator.floorCreateSchema),
  FloorController.create,
);

// Update floor
reservationRouter.patch(
  '/admin/floors/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(ReservationValidator.floorUpdateSchema),
  FloorController.update,
);

// Delete floor
reservationRouter.delete(
  '/admin/floors/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  FloorController.remove,
);

// ==================== Admin - Row Routes ====================

// Get all rows (paginated, for admin)
reservationRouter.get('/admin/rows', adminAuthMiddleware, RowController.getPaginated);

// Get rows by floor
reservationRouter.get(
  '/admin/floors/:floorId/rows',
  adminAuthMiddleware,
  RowController.getByFloor,
);

// Get row by ID
reservationRouter.get(
  '/admin/rows/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  RowController.getById,
);

// Create row
reservationRouter.post(
  '/admin/rows',
  adminAuthMiddleware,
  validateRequestBody(ReservationValidator.rowCreateSchema),
  RowController.create,
);

// Update row
reservationRouter.patch(
  '/admin/rows/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(ReservationValidator.rowUpdateSchema),
  RowController.update,
);

// Delete row
reservationRouter.delete(
  '/admin/rows/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  RowController.remove,
);

// ==================== Public - Floor and Row Routes ====================

// Get all active floors (public)
reservationRouter.get('/floors', FloorController.getAll);

// Get all active rows (public, optionally by floor)
reservationRouter.get('/rows', RowController.getAll);

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

// ==================== Simple Reservation - Admin Routes ====================
// NOTE: These must come BEFORE /admin/:id routes to avoid "simple" being matched as an ID

// Get all simple reservations (admin)
reservationRouter.get('/admin/simple', adminAuthMiddleware, SimpleReservationController.getAll);

// Get simple reservation by ID (admin)
reservationRouter.get(
  '/admin/simple/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  SimpleReservationController.getById,
);

// Accept simple reservation (admin)
reservationRouter.post(
  '/admin/simple/:id/accept',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(ReservationValidator.simpleReservationAcceptSchema),
  SimpleReservationController.accept,
);

// Reject simple reservation (admin)
reservationRouter.post(
  '/admin/simple/:id/reject',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(ReservationValidator.simpleReservationRejectSchema),
  SimpleReservationController.reject,
);

// Cancel simple reservation (admin)
reservationRouter.post(
  '/admin/simple/:id/cancel',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(ReservationValidator.simpleReservationCancelSchema),
  SimpleReservationController.cancel,
);

// Delete simple reservation (admin)
reservationRouter.delete(
  '/admin/simple/:id',
  adminAuthMiddleware,
  validateRequestParams(CommonValidator.paramsValidationSchema),
  SimpleReservationController.remove,
);

// ==================== Admin - Generic Reservation Routes ====================

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

// Update closed dates
reservationRouter.patch(
  '/admin/settings/closed-dates',
  adminAuthMiddleware,
  validateRequestBody(RestaurantSettingsValidator.closedDatesUpdateSchema),
  RestaurantSettingsController.updateClosedDates,
);

// ==================== Simple Reservation - Public Routes ====================

// Get available open dates
reservationRouter.get('/simple/open-dates', SimpleReservationController.getOpenDates);

// Create a simple reservation (public)
reservationRouter.post(
  '/simple',
  validateRequestBody(ReservationValidator.simpleReservationCreateSchema),
  SimpleReservationController.create,
);

// Get reservations by email (public)
reservationRouter.get(
  '/simple/by-email',
  validateRequestQuery(ReservationValidator.simpleReservationEmailQuerySchema),
  SimpleReservationController.getByEmail,
);

export default reservationRouter;
