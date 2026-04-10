import { RestaurantSettingsRepository } from '../../repositories/reservation/restaurant-settings.repository';

import type { IRestaurantSettings, IOperatingHours } from '../../models/reservation/restaurant-settings.model';

const get = async (): Promise<IRestaurantSettings> => {
  return RestaurantSettingsRepository.getOrCreate();
};

const update = async ({ payload }: { payload: Partial<IRestaurantSettings> }): Promise<IRestaurantSettings> => {
  const updated = await RestaurantSettingsRepository.update({ data: payload });
  if (!updated) {
    // Should not happen due to upsert, but just in case
    return RestaurantSettingsRepository.getOrCreate();
  }
  return updated;
};

const updateOperatingHours = async ({
  operatingHours,
}: {
  operatingHours: IOperatingHours[];
}): Promise<IRestaurantSettings> => {
  return update({ payload: { operatingHours } });
};

const updateReservationSettings = async ({
  reservationDuration,
  slotInterval,
  maxAdvanceDays,
  maxGuestsPerReservation,
  minGuestsPerReservation,
}: {
  reservationDuration?: number;
  slotInterval?: number;
  maxAdvanceDays?: number;
  maxGuestsPerReservation?: number;
  minGuestsPerReservation?: number;
}): Promise<IRestaurantSettings> => {
  const payload: Partial<IRestaurantSettings> = {};

  if (reservationDuration !== undefined) payload.reservationDuration = reservationDuration;
  if (slotInterval !== undefined) payload.slotInterval = slotInterval;
  if (maxAdvanceDays !== undefined) payload.maxAdvanceDays = maxAdvanceDays;
  if (maxGuestsPerReservation !== undefined) payload.maxGuestsPerReservation = maxGuestsPerReservation;
  if (minGuestsPerReservation !== undefined) payload.minGuestsPerReservation = minGuestsPerReservation;

  return update({ payload });
};

const updateClosedDates = async ({
  closedDates,
}: {
  closedDates: Date[];
}): Promise<IRestaurantSettings> => {
  return update({ payload: { closedDates } });
};

const updateOrderSettings = async ({
  deliveryEnabled,
  pickupEnabled,
  pickupStartTime,
  pickupEndTime,
  pickupInterval,
  minimumOrderAmount,
  deliveryCharge,
}: {
  deliveryEnabled?: boolean;
  pickupEnabled?: boolean;
  pickupStartTime?: string;
  pickupEndTime?: string;
  pickupInterval?: number;
  minimumOrderAmount?: number;
  deliveryCharge?: number;
}): Promise<IRestaurantSettings> => {
  const payload: Partial<IRestaurantSettings> = {};
  if (deliveryEnabled !== undefined) payload.deliveryEnabled = deliveryEnabled;
  if (pickupEnabled !== undefined) payload.pickupEnabled = pickupEnabled;
  if (pickupStartTime !== undefined) payload.pickupStartTime = pickupStartTime;
  if (pickupEndTime !== undefined) payload.pickupEndTime = pickupEndTime;
  if (pickupInterval !== undefined) payload.pickupInterval = pickupInterval;
  if (minimumOrderAmount !== undefined) payload.minimumOrderAmount = minimumOrderAmount;
  if (deliveryCharge !== undefined) payload.deliveryCharge = deliveryCharge;
  return update({ payload });
};

export const RestaurantSettingsService = {
  get,
  update,
  updateOperatingHours,
  updateReservationSettings,
  updateClosedDates,
  updateOrderSettings,
};
