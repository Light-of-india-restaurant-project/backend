export const SERVER_DETAILS = {
  PORT: 4000,
};

export const EMAIL_CONFIG = {
  DEFAULT_SENDER: process.env.DEFAULT_SENDER || '',
};

export const JWT_SECRET_KEY = {
  accessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY || '',
  refreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY || '',
  refreshTokenMaxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 1000 * 60 * 60 * 24,
  accessTokenMaxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE) || 1000 * 60 * 60 * 24, // 1 day
};

export const AUTH_CONFIG = {
  refreshToken: 'platform-engineering-refresh-token',
  refreshTokenMaxAge: 1000 * 60 * 60 * 24,
  accessTokenMaxAge: 1000 * 60 * 60 * 24, // 1 day
  authHeader: 'authorization',
  bearerName: 'Bearer',
};
