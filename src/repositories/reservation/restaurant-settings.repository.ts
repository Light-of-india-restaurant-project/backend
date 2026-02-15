import { RestaurantSettingsModel, DAYS_OF_WEEK } from '../../models/reservation/restaurant-settings.model';

import type { IRestaurantSettings } from '../../models/reservation/restaurant-settings.model';
import type { RepositoryOptions } from '../repository.types';

// Get settings (singleton - there's only one settings document)
const get = async ({ options }: { options?: RepositoryOptions } = {}): Promise<IRestaurantSettings | null> => {
  return RestaurantSettingsModel.findOne({}, undefined, { session: options?.session });
};

// Get or create default settings
const getOrCreate = async ({ options }: { options?: RepositoryOptions } = {}): Promise<IRestaurantSettings> => {
  let settings = await RestaurantSettingsModel.findOne({}, undefined, { session: options?.session });

  if (!settings) {
    // Create default settings
    const defaultSettings = {
      operatingHours: DAYS_OF_WEEK.map((day) => ({
        day,
        isOpen: day !== 'sunday',
        openTime: '09:00',
        closeTime: '22:00',
      })),
      reservationDuration: 90,
      slotInterval: 30,
      maxAdvanceDays: 30,
      maxGuestsPerReservation: 10,
      minGuestsPerReservation: 1,
    };

    const result = await RestaurantSettingsModel.create(
      [defaultSettings],
      options?.session ? { session: options.session } : undefined,
    );
    settings = result[0];
  }

  return settings;
};

// Update settings (upsert)
const update = async ({
  data,
  options,
}: {
  data: Partial<IRestaurantSettings>;
  options?: RepositoryOptions;
}): Promise<IRestaurantSettings | null> => {
  return RestaurantSettingsModel.findOneAndUpdate(
    {},
    data,
    {
      new: true,
      upsert: true,
      session: options?.session,
    },
  );
};

export const RestaurantSettingsRepository = {
  get,
  getOrCreate,
  update,
};
