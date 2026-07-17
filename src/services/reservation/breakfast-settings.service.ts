import { BreakfastSettingsRepository } from '../../repositories/reservation/breakfast-settings.repository';

import type {
  IBreakfastSettings,
} from '../../models/reservation/breakfast-settings.model';
import type { IOperatingHours, IRestaurantClosedDate } from '../../models/reservation/restaurant-settings.model';

const get = async (): Promise<IBreakfastSettings> => {
  return BreakfastSettingsRepository.getOrCreate();
};

const update = async ({ payload }: { payload: Partial<IBreakfastSettings> }): Promise<IBreakfastSettings> => {
  const updated = await BreakfastSettingsRepository.update({ data: payload });
  if (!updated) {
    return BreakfastSettingsRepository.getOrCreate();
  }
  return updated;
};

const updateOperatingHours = async ({
  operatingHours,
}: {
  operatingHours: IOperatingHours[];
}): Promise<IBreakfastSettings> => {
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
}): Promise<IBreakfastSettings> => {
  const payload: Partial<IBreakfastSettings> = {};

  if (reservationDuration !== undefined) payload.reservationDuration = reservationDuration;
  if (slotInterval !== undefined) payload.slotInterval = slotInterval;
  if (maxAdvanceDays !== undefined) payload.maxAdvanceDays = maxAdvanceDays;
  if (maxGuestsPerReservation !== undefined) payload.maxGuestsPerReservation = maxGuestsPerReservation;
  if (minGuestsPerReservation !== undefined) payload.minGuestsPerReservation = minGuestsPerReservation;

  return update({ payload });
};

const updateClosedDates = async ({
  closedDates,
  openDates,
}: {
  closedDates?: Date[];
  openDates?: Date[];
}): Promise<IBreakfastSettings> => {
  const payload: Partial<IBreakfastSettings> = {};

  const normalizeDateKey = (date: Date | string): string => {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizedClosedDates = closedDates
    ? Array.from(new Set(closedDates.map(normalizeDateKey))).map((dateKey) => new Date(`${dateKey}T12:00:00`))
    : undefined;

  let normalizedOpenDates = openDates
    ? Array.from(new Set(openDates.map(normalizeDateKey))).map((dateKey) => new Date(`${dateKey}T12:00:00`))
    : undefined;

  if (normalizedClosedDates && normalizedOpenDates) {
    const closedKeys = new Set(normalizedClosedDates.map(normalizeDateKey));
    normalizedOpenDates = normalizedOpenDates.filter((date) => !closedKeys.has(normalizeDateKey(date)));
  }

  if (normalizedClosedDates !== undefined) {
    payload.closedDates = normalizedClosedDates;
  }

  if (normalizedOpenDates !== undefined) {
    payload.openDates = normalizedOpenDates;
  }

  return update({ payload });
};

const updateRestaurantClosedDates = async ({
  restaurantClosedDates,
}: {
  restaurantClosedDates: Array<{ date: Date | string; reason: string }>;
}): Promise<IBreakfastSettings> => {
  const normalizeDateKey = (date: Date | string): string => {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const deduplicatedByDate = new Map<string, IRestaurantClosedDate>();

  for (const item of restaurantClosedDates) {
    const dateKey = normalizeDateKey(item.date);
    const reason = item.reason.trim();

    deduplicatedByDate.set(dateKey, {
      date: new Date(`${dateKey}T12:00:00`),
      reason,
    });
  }

  return update({
    payload: {
      restaurantClosedDates: Array.from(deduplicatedByDate.values()),
    },
  });
};

export const BreakfastSettingsService = {
  get,
  update,
  updateOperatingHours,
  updateReservationSettings,
  updateClosedDates,
  updateRestaurantClosedDates,
};
