import { DynamicMessages } from '../../constant/error';
import DeliveryZoneService from '../../services/delivery/delivery-zone.service';

import type { Request, Response, NextFunction } from 'express';

// Create a new delivery zone
const createDeliveryZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zone = await DeliveryZoneService.createDeliveryZone(req.body);
    res.status(201).json({
      success: true,
      message: DynamicMessages.createMessage('Delivery zone'),
      zone,
    });
  } catch (error) {
    next(error);
  }
};

// Get all delivery zones (admin - includes inactive)
const getAllDeliveryZones = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const zones = await DeliveryZoneService.getAllDeliveryZones(includeInactive);
    res.status(200).json({
      success: true,
      message: DynamicMessages.fetched('Delivery zones'),
      zones,
      total: zones.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get active delivery zones (public)
const getActiveDeliveryZones = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zones = await DeliveryZoneService.getAllDeliveryZones(false);
    res.status(200).json({
      success: true,
      message: DynamicMessages.fetched('Delivery zones'),
      zones,
      total: zones.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get a delivery zone by ID
const getDeliveryZoneById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zone = await DeliveryZoneService.getDeliveryZoneById(req.params.id);
    res.status(200).json({
      success: true,
      message: DynamicMessages.fetched('Delivery zone'),
      zone,
    });
  } catch (error) {
    next(error);
  }
};

// Update a delivery zone
const updateDeliveryZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zone = await DeliveryZoneService.updateDeliveryZone(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: DynamicMessages.updateMessage('Delivery zone'),
      zone,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a delivery zone
const deleteDeliveryZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await DeliveryZoneService.deleteDeliveryZone(req.params.id);
    res.status(200).json({
      success: true,
      message: DynamicMessages.deleteMessage('Delivery zone'),
    });
  } catch (error) {
    next(error);
  }
};

// Toggle delivery zone status
const toggleDeliveryZoneStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zone = await DeliveryZoneService.toggleDeliveryZoneStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: `Delivery zone ${zone.isActive ? 'activated' : 'deactivated'} successfully`,
      zone,
    });
  } catch (error) {
    next(error);
  }
};

// Check if postal code is deliverable (public endpoint)
const checkPostalCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { postalCode } = req.params;
    
    if (!postalCode) {
      res.status(400).json({
        success: false,
        deliverable: false,
        message: 'Postal code is required',
      });
      return;
    }

    const result = await DeliveryZoneService.checkPostalCodeDeliverable(postalCode);
    
    // Format postal code for response
    const cleanCode = postalCode.replace(/\s/g, '').toUpperCase();
    const formattedCode = cleanCode.length === 6 
      ? `${cleanCode.substring(0, 4)} ${cleanCode.substring(4)}` 
      : postalCode;

    res.status(200).json({
      success: true,
      deliverable: result.deliverable,
      postalCode: formattedCode,
      zoneName: result.zone?.name,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const DeliveryZoneController = {
  createDeliveryZone,
  getAllDeliveryZones,
  getActiveDeliveryZones,
  getDeliveryZoneById,
  updateDeliveryZone,
  deleteDeliveryZone,
  toggleDeliveryZoneStatus,
  checkPostalCode,
};

export default DeliveryZoneController;
