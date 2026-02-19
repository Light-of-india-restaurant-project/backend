import { DeliveryZoneModel } from '../../models/delivery/delivery-zone.model';
import createError from '../../utils/http.error';

import type { IDeliveryZone } from '../../models/delivery/delivery-zone.model';

interface CreateDeliveryZonePayload {
  name: string;
  postalCode: string;
  isActive?: boolean;
  description?: string;
}

interface UpdateDeliveryZonePayload {
  name?: string;
  postalCode?: string;
  isActive?: boolean;
  description?: string;
}

/**
 * Create a new delivery zone
 */
const createDeliveryZone = async (payload: CreateDeliveryZonePayload): Promise<IDeliveryZone> => {
  // Check for duplicate postal code
  const existing = await DeliveryZoneModel.findOne({ postalCode: payload.postalCode });
  if (existing) {
    throw createError(400, 'A delivery zone with this postal code already exists');
  }

  const zone = new DeliveryZoneModel(payload);
  await zone.save();
  return zone;
};

/**
 * Get all delivery zones
 */
const getAllDeliveryZones = async (includeInactive = false): Promise<IDeliveryZone[]> => {
  const query = includeInactive ? {} : { isActive: true };
  return DeliveryZoneModel.find(query).sort({ postalCode: 1 });
};

/**
 * Get a delivery zone by ID
 */
const getDeliveryZoneById = async (id: string): Promise<IDeliveryZone> => {
  const zone = await DeliveryZoneModel.findById(id);
  if (!zone) {
    throw createError(404, 'Delivery zone not found');
  }
  return zone;
};

/**
 * Update a delivery zone
 */
const updateDeliveryZone = async (id: string, payload: UpdateDeliveryZonePayload): Promise<IDeliveryZone> => {
  const zone = await DeliveryZoneModel.findById(id);
  if (!zone) {
    throw createError(404, 'Delivery zone not found');
  }

  // If updating postal code, check for duplicates
  if (payload.postalCode && payload.postalCode !== zone.postalCode) {
    const existing = await DeliveryZoneModel.findOne({ postalCode: payload.postalCode });
    if (existing) {
      throw createError(400, 'A delivery zone with this postal code already exists');
    }
  }

  Object.assign(zone, payload);
  await zone.save();
  return zone;
};

/**
 * Delete a delivery zone
 */
const deleteDeliveryZone = async (id: string): Promise<void> => {
  const zone = await DeliveryZoneModel.findById(id);
  if (!zone) {
    throw createError(404, 'Delivery zone not found');
  }
  await zone.deleteOne();
};

/**
 * Toggle delivery zone active status
 */
const toggleDeliveryZoneStatus = async (id: string): Promise<IDeliveryZone> => {
  const zone = await DeliveryZoneModel.findById(id);
  if (!zone) {
    throw createError(404, 'Delivery zone not found');
  }
  zone.isActive = !zone.isActive;
  await zone.save();
  return zone;
};

/**
 * Check if a postal code is in any active delivery zone
 * @param postalCode - Full postal code (e.g., "3011 AB" or "3011AB")
 * @returns Object with deliverable status and zone info
 */
const checkPostalCodeDeliverable = async (
  postalCode: string,
): Promise<{ deliverable: boolean; zone?: IDeliveryZone; message: string }> => {
  // Extract numeric part (first 4 digits)
  const cleanCode = postalCode.replace(/\s/g, '');
  const numericPart = cleanCode.substring(0, 4);

  if (!/^[0-9]{4}$/.test(numericPart)) {
    return {
      deliverable: false,
      message: 'Invalid postal code format. Please enter a valid Dutch postal code.',
    };
  }

  // Check if letter part exists and is valid (2 letters)
  const letterPart = cleanCode.substring(4);
  if (letterPart.length !== 2 || !/^[A-Za-z]{2}$/.test(letterPart)) {
    return {
      deliverable: false,
      message: 'Invalid postal code format. Please include 4 digits followed by 2 letters (e.g., 3011 AB).',
    };
  }

  // Find active zone with matching postal code
  const zone = await DeliveryZoneModel.findOne({
    isActive: true,
    postalCode: numericPart,
  });

  if (zone) {
    return {
      deliverable: true,
      zone,
      message: `Great! We deliver to your area (${zone.name}).`,
    };
  }

  return {
    deliverable: false,
    message: 'Sorry, we do not currently deliver to your area.',
  };
};

const DeliveryZoneService = {
  createDeliveryZone,
  getAllDeliveryZones,
  getDeliveryZoneById,
  updateDeliveryZone,
  deleteDeliveryZone,
  toggleDeliveryZoneStatus,
  checkPostalCodeDeliverable,
};

export default DeliveryZoneService;
