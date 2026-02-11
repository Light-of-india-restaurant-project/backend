import createError from '../utils/http.error';
import logger from '../utils/logger';

import type { CustomRequest } from '../interfaces/auth.interface';
import type { NextFunction, Response } from 'express';

/**
 * Middleware to check if user has a specific role
 * TODO: Implement your own role checking logic based on your user model
 */
export const requireRole = (_roleLabel: string) => {
  return async (req: CustomRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createError(401, 'Authentication required'));
      }

      // TODO: Implement your role checking logic here
      // Example: Check if req.user.role matches roleLabel
      // const hasRole = req.user.role === roleLabel;
      // if (!hasRole) {
      //   return next(createError(403, `Access denied. Required role: ${roleLabel}`));
      // }

      next();
    } catch (error) {
      logger.error('Error in requireRole middleware:', error);
      next(createError(500, 'Authorization check failed'));
    }
  };
};

/**
 * Middleware to check if user has any of the specified roles
 */
export const requireAnyRole = (_roleLabels: string[]) => {
  return async (req: CustomRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createError(401, 'Authentication required'));
      }

      // TODO: Implement your role checking logic here
      // Example: Check if req.user.role is in roleLabels array
      // const hasRole = roleLabels.includes(req.user.role);
      // if (!hasRole) {
      //   return next(createError(403, `Access denied. Required any role: ${roleLabels.join(', ')}`));
      // }

      next();
    } catch (error) {
      logger.error('Error in requireAnyRole middleware:', error);
      next(createError(500, 'Authorization check failed'));
    }
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = async (req: CustomRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(createError(401, 'Authentication required'));
    }

    // TODO: Implement your admin check logic here
    // Example:
    // const isAdmin = req.user.role === 'admin';
    // if (!isAdmin) {
    //   return next(createError(403, 'Administrator access required'));
    // }

    next();
  } catch (error) {
    logger.error('Error in requireAdmin middleware:', error);
    next(createError(500, 'Authorization check failed'));
  }
};

/**
 * Higher-order function for custom permission checking
 */
export const requireCustomPermission = (permissionChecker: (req: CustomRequest) => Promise<boolean>, errorMessage = 'Access denied') => {
  return async (req: CustomRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createError(401, 'Authentication required'));
      }

      const hasAccess = await permissionChecker(req);

      if (!hasAccess) {
        logger.warn(`User ${req.user} denied custom access: ${errorMessage}`);
        return next(createError(403, errorMessage));
      }

      next();
    } catch (error) {
      logger.error('Error in requireCustomPermission middleware:', error);
      next(createError(500, 'Authorization check failed'));
    }
  };
};

/**
 * Check if user owns the resource
 * Example: User can only update their own profile
 */
export const requireOwnership = (getResourceOwnerId: (req: CustomRequest) => string | Promise<string>) => {
  return requireCustomPermission(async (req: CustomRequest) => {
    const resourceOwnerId = await getResourceOwnerId(req);
    return req.user === resourceOwnerId || req.user?._id?.toString() === resourceOwnerId;
  }, 'You can only access your own resources');
};
