import { BreakfastSettingsModel } from '../../models/reservation/breakfast-settings.model';
import { DAYS_OF_WEEK } from '../../models/reservation/restaurant-settings.model';

import type { IBreakfastSettings } from '../../models/reservation/breakfast-settings.model';
import type { RepositoryOptions } from '../repository.types';

const get = async ({ options }: { options?: RepositoryOptions } = {}): Promise<IBreakfastSettings | null> => {
  return BreakfastSettingsModel.findOne({}, undefined, { session: options?.session });
};

const getOrCreate = async ({ options }: { options?: RepositoryOptions } = {}): Promise<IBreakfastSettings> => {
  let settings = await BreakfastSettingsModel.findOne({}, undefined, { session: options?.session });

  if (!settings) {
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

    const result = await BreakfastSettingsModel.create(
      [defaultSettings],
      options?.session ? { session: options.session } : undefined,
    );
    settings = result[0];
  }

  return settings;
};

const update = async ({
  data,
  options,
}: {
  data: Partial<IBreakfastSettings>;
  options?: RepositoryOptions;
}): Promise<IBreakfastSettings | null> => {
  return BreakfastSettingsModel.findOneAndUpdate(
    {},
    data,
    {
      new: true,
      upsert: true,
      session: options?.session,
    },
  );
};

export const BreakfastSettingsRepository = {
  get,
  getOrCreate,
  update,
};
