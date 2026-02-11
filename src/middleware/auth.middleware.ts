import { AUTH_CONFIG, JWT_SECRET_KEY } from '../config/server.config';
import { PLAIN_RESPONSE_MSG } from '../constant/error';
import UserService from '../services/user/user.service';
import createError from '../utils/http.error';
import jwtGenerator from '../utils/jwt.generator';
import { getValue } from '../utils/object';

import type { CustomRequest } from '../interfaces/auth.interface';
import type { NextFunction, Response } from 'express';

/**
 * Simple Bearer token authentication middleware for admin routes
 * Only requires Authorization header with Bearer token
 */
export const adminAuthMiddleware = (req: CustomRequest, _res: Response, next: NextFunction): void => {
  const authorizationData = getValue(req.headers, 'authorization');

  if (!authorizationData) {
    return next(createError(401, PLAIN_RESPONSE_MSG.unAuthenticated));
  }

  const [bearer, jwtAccessToken] = authorizationData.split(' ');

  if (bearer !== AUTH_CONFIG.bearerName || !jwtAccessToken) {
    return next(createError(401, PLAIN_RESPONSE_MSG.unAuthenticated));
  }

  const { payload } = jwtGenerator.verifyAccessToken(jwtAccessToken, JWT_SECRET_KEY.accessTokenPrivateKey);

  if (!payload) {
    return next(createError(401, 'Invalid or expired token'));
  }

  req.user = payload.id;
  next();
};

export const authenticationMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const jwtRefreshToken = getValue(req.cookies, AUTH_CONFIG.refreshToken);
  const authorizationData = getValue(req.headers, 'authorization');

  if (!authorizationData || !jwtRefreshToken) {
    return next(createError(401, PLAIN_RESPONSE_MSG.unAuthenticated));
  }

  const [bearer, jwtAccessToken] = authorizationData.split(' ');

  if (bearer !== AUTH_CONFIG.bearerName || !jwtAccessToken) {
    return next(createError(401, PLAIN_RESPONSE_MSG.unAuthenticated));
  }

  const { payload } = jwtGenerator.verifyAccessToken(jwtAccessToken, JWT_SECRET_KEY.accessTokenPrivateKey);

  if (payload) {
    req.user = payload.id;
    return next();
  }

  const { refreshPayload } = jwtGenerator.verifyRefreshToken(jwtRefreshToken, JWT_SECRET_KEY.refreshTokenPrivateKey);

  if (!refreshPayload) {
    res.clearCookie(AUTH_CONFIG.refreshToken);
    return next(createError(401, PLAIN_RESPONSE_MSG.unAuthenticated));
  }

  // Generate new tokens
  const newAccessToken = jwtGenerator.generateAccessToken(refreshPayload.id, JWT_SECRET_KEY.accessTokenPrivateKey, AUTH_CONFIG.accessTokenMaxAge);
  const newRefreshToken = jwtGenerator.generateRefreshToken(refreshPayload.id, JWT_SECRET_KEY.refreshTokenPrivateKey, AUTH_CONFIG.refreshTokenMaxAge);

  req.user = refreshPayload.id;

  res.cookie(AUTH_CONFIG.refreshToken, newRefreshToken, {
    httpOnly: req.secure,
    secure: req.secure,
    sameSite: 'lax',
    maxAge: AUTH_CONFIG.refreshTokenMaxAge,
  });

  res.setHeader(AUTH_CONFIG.authHeader, `${AUTH_CONFIG.bearerName} ${newAccessToken}`);

  next();
};

export const attachUserInfo = async (req: CustomRequest, _res: Response, next: NextFunction) => {
  const user = await UserService.getUserInfoById(req.user);
  req.user = user;
  next();
};
