import createError from 'http-errors';

import { ReservationModel } from '../models/reservation/reservation.model';
import { SimpleReservationModel } from '../models/reservation/simple-reservation.model';
import { BreakfastReservationModel } from '../models/reservation/breakfast-reservation.model';

import type { NextFunction, Request, Response } from 'express';

type RateLimitEntry = {
  count: number;
  firstRequestAt: number;
};

type RecentReservation = {
  name: string;
  createdAt: Date;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 4;
const EMAIL_BURST_WINDOW_MS = 30 * 60 * 1000;
const MAX_EMAIL_ATTEMPTS_PER_WINDOW = 2;
const ipWindowStore = new Map<string, RateLimitEntry>();

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const normalizeName = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const looksLikeRandomName = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed.length < 12) {
    return false;
  }

  if (trimmed.includes(' ')) {
    return false;
  }

  const alphaChars = trimmed.replace(/[^a-zA-Z]/g, '');
  if (alphaChars.length >= 10) {
    let caseSwitches = 0;
    for (let i = 1; i < alphaChars.length; i += 1) {
      const prevUpper = alphaChars[i - 1] === alphaChars[i - 1].toUpperCase();
      const currUpper = alphaChars[i] === alphaChars[i].toUpperCase();
      if (prevUpper !== currUpper) {
        caseSwitches += 1;
      }
    }

    if (caseSwitches >= 6) {
      return true;
    }
  }

  // Very low vowel ratio in long single-token names is a common bot pattern.
  const letters = alphaChars;
  if (letters.length < 10) {
    return false;
  }

  const vowelCount = (letters.match(/[aeiouAEIOU]/g) || []).length;
  const vowelRatio = vowelCount / letters.length;
  return vowelRatio < 0.22;
};

const enforceIpRateLimit = (req: Request): void => {
  const key = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const current = ipWindowStore.get(key);

  if (!current || now - current.firstRequestAt > WINDOW_MS) {
    ipWindowStore.set(key, { count: 1, firstRequestAt: now });
    return;
  }

  current.count += 1;
  ipWindowStore.set(key, current);

  if (current.count > MAX_REQUESTS_PER_WINDOW) {
    throw createError(429, 'Too many reservation attempts. Please try again later.');
  }
};

const loadRecentByEmail = async (email: string): Promise<RecentReservation[]> => {
  const cutoff = new Date(Date.now() - EMAIL_BURST_WINDOW_MS);

  const [simple, breakfast, regular] = await Promise.all([
    SimpleReservationModel.find({ email, createdAt: { $gte: cutoff } }, { name: 1, createdAt: 1 }).lean(),
    BreakfastReservationModel.find({ email, createdAt: { $gte: cutoff } }, { name: 1, createdAt: 1 }).lean(),
    ReservationModel.find({ email, createdAt: { $gte: cutoff } }, { name: 1, createdAt: 1 }).lean(),
  ]);

  return [...simple, ...breakfast, ...regular]
    .filter((item) => Boolean(item?.name) && Boolean(item?.createdAt))
    .map((item) => ({ name: item.name as string, createdAt: item.createdAt as Date }));
};

const reservationSpamGuardMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    enforceIpRateLimit(req);

    const nameRaw = typeof req.body?.name === 'string' ? req.body.name : '';
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email : '';

    if (!nameRaw || !emailRaw) {
      throw createError(400, 'Name and email are required');
    }

    const name = normalizeName(nameRaw);
    const email = normalizeEmail(emailRaw);
    const recent = await loadRecentByEmail(email);

    if (recent.length >= MAX_EMAIL_ATTEMPTS_PER_WINDOW) {
      throw createError(429, 'Too many reservation attempts with this email. Please try again later.');
    }

    const recentDifferentName = recent.some((item) => normalizeName(item.name) !== name);
    if (recentDifferentName) {
      throw createError(429, 'Reservation blocked due to suspicious repeated details. Please contact the restaurant.');
    }

    if (looksLikeRandomName(nameRaw) && recent.length > 0) {
      throw createError(429, 'Reservation blocked due to suspicious activity. Please contact the restaurant.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default reservationSpamGuardMiddleware;