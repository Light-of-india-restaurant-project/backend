import type { DayOfWeek, IOperatingHours, IRestaurantClosedDate } from '../../models/reservation/restaurant-settings.model';

interface ReservationAvailabilitySettings {
  operatingHours: IOperatingHours[];
  closedDates?: Date[];
  openDates?: Date[];
  restaurantClosedDates?: IRestaurantClosedDate[];
}

interface DateAvailability {
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isOpen: boolean;
  isOpenByWeek: boolean;
  isOpenSpecifically: boolean;
  isClosedSpecifically: boolean;
  isClosedByRestaurant: boolean;
  closureReason: string | null;
}

interface RestaurantClosureStatus {
  isClosed: boolean;
  reason: string | null;
}

const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

const toDateKey = (date: Date | string): string => {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isDateInList = (date: Date, dates: Date[] | undefined): boolean => {
  if (!dates?.length) return false;

  const dateKey = toDateKey(date);
  return dates.some((item) => toDateKey(item) === dateKey);
};

const getRestaurantClosureForDate = (settings: ReservationAvailabilitySettings, date: Date): RestaurantClosureStatus => {
  if (!settings.restaurantClosedDates?.length) {
    return { isClosed: false, reason: null };
  }

  const dateKey = toDateKey(date);
  const match = settings.restaurantClosedDates.find((item) => toDateKey(item.date) === dateKey);

  return {
    isClosed: !!match,
    reason: match?.reason ?? null,
  };
};

const resolveDateAvailability = (settings: ReservationAvailabilitySettings, date: Date): DateAvailability => {
  const dayOfWeek = getDayOfWeek(date);
  const daySettings = settings.operatingHours.find((hours) => hours.day === dayOfWeek);

  const isOpenByWeek = daySettings?.isOpen ?? false;
  const isOpenSpecifically = isDateInList(date, settings.openDates);
  const isClosedSpecifically = isDateInList(date, settings.closedDates);
  const restaurantClosure = getRestaurantClosureForDate(settings, date);
  const isOpen = (isOpenByWeek || isOpenSpecifically) && !isClosedSpecifically && !restaurantClosure.isClosed;

  return {
    dayOfWeek,
    openTime: daySettings?.openTime ?? null,
    closeTime: daySettings?.closeTime ?? null,
    isOpen,
    isOpenByWeek,
    isOpenSpecifically,
    isClosedSpecifically,
    isClosedByRestaurant: restaurantClosure.isClosed,
    closureReason: restaurantClosure.reason,
  };
};

export { getDayOfWeek, isDateInList, resolveDateAvailability, toDateKey, getRestaurantClosureForDate };
export type { DateAvailability };
