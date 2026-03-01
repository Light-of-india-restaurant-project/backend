import { DynamicMessages } from '../../constant/error';
import { RestaurantSettingsService } from '../../services/reservation/restaurant-settings.service';

import type { Request, Response, NextFunction } from 'express';

// Get restaurant settings
const get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await RestaurantSettingsService.get();
    res.status(200).json({
      message: DynamicMessages.fetched('Restaurant settings'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Update all settings
const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await RestaurantSettingsService.update({ payload: req.body });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Restaurant settings'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Update operating hours only
const updateOperatingHours = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await RestaurantSettingsService.updateOperatingHours({
      operatingHours: req.body.operatingHours,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Operating hours'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Update reservation settings only
const updateReservationSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await RestaurantSettingsService.updateReservationSettings(req.body);
    res.status(200).json({
      message: DynamicMessages.updateMessage('Reservation settings'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Update closed dates
const updateClosedDates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await RestaurantSettingsService.updateClosedDates({
      closedDates: req.body.closedDates,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Closed dates'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const RestaurantSettingsController = {
  get,
  update,
  updateOperatingHours,
  updateReservationSettings,
  updateClosedDates,
};
