import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

import createError from './http.error';

interface FormGuardPayload {
  form: string;
  iat: number;
  exp: number;
  nonce: string;
}

const TOKEN_TTL_MS = 15 * 60 * 1000;

const base64UrlEncode = (value: string): string =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const base64UrlDecode = (value: string): string => {
  const padded = `${value}${'='.repeat((4 - (value.length % 4)) % 4)}`.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64').toString('utf8');
};

const getFormGuardSecret = (): string => {
  const secret = process.env.FORM_GUARD_SECRET || process.env.ACCESS_TOKEN_PRIVATE_KEY || '';
  if (!secret) {
    throw createError(500, 'FORM_GUARD_SECRET is not configured');
  }
  return secret;
};

const sign = ({ payloadBase64 }: { payloadBase64: string }): string => {
  return createHmac('sha256', getFormGuardSecret()).update(payloadBase64).digest('base64url');
};

export const createFormGuardToken = ({ form }: { form: string }): { token: string; expiresInMs: number } => {
  const iat = Date.now();
  const payload: FormGuardPayload = {
    form,
    iat,
    exp: iat + TOKEN_TTL_MS,
    nonce: randomBytes(12).toString('hex'),
  };

  const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
  const signature = sign({ payloadBase64 });
  return {
    token: `${payloadBase64}.${signature}`,
    expiresInMs: TOKEN_TTL_MS,
  };
};

export const verifyFormGuardToken = ({
  token,
  expectedForm,
}: {
  token: string;
  expectedForm: string;
}): FormGuardPayload => {
  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) {
    throw createError(400, 'Invalid form security token');
  }

  const expectedSignature = sign({ payloadBase64 });
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw createError(400, 'Invalid form security signature');
  }

  let payload: FormGuardPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadBase64)) as FormGuardPayload;
  } catch {
    throw createError(400, 'Invalid form security payload');
  }

  if (payload.form !== expectedForm) {
    throw createError(400, 'Invalid form token scope');
  }

  if (payload.exp < Date.now()) {
    throw createError(400, 'Form security token expired');
  }

  return payload;
};
