import { DynamicMessages } from '../../constant/error';
import { BreakfastSettingsService } from '../../services/reservation/breakfast-settings.service';

import type { Request, Response, NextFunction } from 'express';

const get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await BreakfastSettingsService.get();
    res.status(200).json({
      message: DynamicMessages.fetched('Breakfast settings'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await BreakfastSettingsService.update({ payload: req.body });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Breakfast settings'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateOperatingHours = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await BreakfastSettingsService.updateOperatingHours({
      operatingHours: req.body.operatingHours,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Breakfast operating hours'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateReservationSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await BreakfastSettingsService.updateReservationSettings(req.body);
    res.status(200).json({
      message: DynamicMessages.updateMessage('Breakfast reservation settings'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateClosedDates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await BreakfastSettingsService.updateClosedDates({
      closedDates: req.body.closedDates,
      openDates: req.body.openDates,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Breakfast closed dates'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateRestaurantClosedDates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await BreakfastSettingsService.updateRestaurantClosedDates({
      restaurantClosedDates: req.body.restaurantClosedDates,
    });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Breakfast restaurant closed dates'),
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const BreakfastSettingsController = {
  get,
  update,
  updateOperatingHours,
  updateReservationSettings,
  updateClosedDates,
  updateRestaurantClosedDates,
};
