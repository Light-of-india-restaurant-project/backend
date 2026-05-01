import type { DayOfWeek, IRestaurantSettings } from '../../models/reservation/restaurant-settings.model';

interface DateAvailability {
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isOpen: boolean;
  isOpenByWeek: boolean;
  isOpenSpecifically: boolean;
  isClosedSpecifically: boolean;
}

const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

const toDateKey = (date: Date | string): string => {
  return new Date(date).toISOString().split('T')[0];
};

const isDateInList = (date: Date, dates: Date[] | undefined): boolean => {
  if (!dates?.length) return false;

  const dateKey = toDateKey(date);
  return dates.some((item) => toDateKey(item) === dateKey);
};

const resolveDateAvailability = (settings: IRestaurantSettings, date: Date): DateAvailability => {
  const dayOfWeek = getDayOfWeek(date);
  const daySettings = settings.operatingHours.find((hours) => hours.day === dayOfWeek);

  const isOpenByWeek = daySettings?.isOpen ?? false;
  const isOpenSpecifically = isDateInList(date, settings.openDates);
  const isClosedSpecifically = isDateInList(date, settings.closedDates);
  const isOpen = (isOpenByWeek || isOpenSpecifically) && !isClosedSpecifically;

  return {
    dayOfWeek,
    openTime: daySettings?.openTime ?? null,
    closeTime: daySettings?.closeTime ?? null,
    isOpen,
    isOpenByWeek,
    isOpenSpecifically,
    isClosedSpecifically,
  };
};

export { getDayOfWeek, isDateInList, resolveDateAvailability, toDateKey };
export type { DateAvailability };
