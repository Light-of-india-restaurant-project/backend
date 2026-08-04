import createError from 'http-errors';

import { verifyFormGuardToken } from '../utils/form-guard';

import type { NextFunction, Request, Response } from 'express';

interface NoCaptchaGuardOptions {
  formId: string;
  emailField?: string;
  minFillMs?: number;
  maxAgeMs?: number;
  maxAttemptsPerWindow?: number;
  windowMs?: number;
  cooldownMs?: number;
}

type AttemptCounter = {
  count: number;
  firstAt: number;
};

const ipCounters = new Map<string, AttemptCounter>();
const identityCooldown = new Map<string, number>();

const normalizeIdentityValue = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().toLowerCase();
};

const registerAttempt = ({ key, maxAttempts, windowMs }: { key: string; maxAttempts: number; windowMs: number }): void => {
  const now = Date.now();
  const current = ipCounters.get(key);

  if (!current || now - current.firstAt > windowMs) {
    ipCounters.set(key, { count: 1, firstAt: now });
    return;
  }

  current.count += 1;
  ipCounters.set(key, current);

  if (current.count > maxAttempts) {
    throw createError(429, 'Too many attempts. Please try again shortly.');
  }
};

const enforceIdentityCooldown = ({ identityKey, cooldownMs }: { identityKey: string; cooldownMs: number }): void => {
  if (!identityKey) {
    return;
  }

  const now = Date.now();
  const cooldownUntil = identityCooldown.get(identityKey) || 0;
  if (cooldownUntil > now) {
    throw createError(429, 'Please wait a moment before trying again.');
  }

  identityCooldown.set(identityKey, now + cooldownMs);
};

const getString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const noCaptchaFormGuardMiddleware = (options: NoCaptchaGuardOptions) => {
  const {
    formId,
    emailField = 'email',
    minFillMs = 1400,
    maxAgeMs = 45 * 60 * 1000,
    maxAttemptsPerWindow = 8,
    windowMs = 10 * 60 * 1000,
    cooldownMs = 5000,
  } = options;

  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
      registerAttempt({ key: `${formId}:${ip}`, maxAttempts: maxAttemptsPerWindow, windowMs });

      const emailValue = normalizeIdentityValue(req.body?.[emailField]);
      enforceIdentityCooldown({ identityKey: `${formId}:${ip}:${emailValue}`, cooldownMs });

      const honeypot = getString(req.body?.website);
      if (honeypot) {
        throw createError(400, 'Submission rejected');
      }

      const guardToken = getString(req.body?.guardToken);
      const startedAtRaw = req.body?.guardStartedAt;
      const startedAt = typeof startedAtRaw === 'number' ? startedAtRaw : Number(startedAtRaw);

      if (!guardToken || Number.isNaN(startedAt)) {
        throw createError(400, 'Missing form security metadata');
      }

      verifyFormGuardToken({ token: guardToken, expectedForm: formId });

      const now = Date.now();
      const elapsed = now - startedAt;

      if (elapsed < minFillMs) {
        throw createError(400, 'Submission too fast. Please try again.');
      }

      if (elapsed > maxAgeMs) {
        throw createError(400, 'Form expired. Please refresh and submit again.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default noCaptchaFormGuardMiddleware;
