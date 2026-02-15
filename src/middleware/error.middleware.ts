/* eslint-disable @typescript-eslint/no-explicit-any */
import corsConfig from '../config/cors.config';
import logger from '../utils/logger';

import type { Application, Response, NextFunction, Request } from 'express';

interface CustomError extends Error {
  statusCode: number;
  message: string;
  stack: any;
}

const errorHandler: any = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  logger.error(err);
  
  // Ensure CORS headers are set on error responses
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    // Check if origin is in allowed list (also check with/without trailing slash)
    const isAllowed = corsConfig.origin.some((allowed: string) => 
      origin === allowed || origin.startsWith(allowed.replace(/\/$/, ''))
    );
    if (isAllowed || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  const errStatus = err.statusCode ?? 500;
  const errMsg = err.message ?? 'Something went wrong';
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
  next();
};

const apiEndPointNotExistHandler = (req: Request, res: Response, next: NextFunction) => {
  // Ensure CORS headers are set on 404 responses
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    const isAllowed = corsConfig.origin.some((allowed: string) => 
      origin === allowed || origin.startsWith(allowed.replace(/\/$/, ''))
    );
    if (isAllowed || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  logger.error(`${fullUrl} endpoint does not exist.`);
  res.status(404).json({ message: `${fullUrl} endpoint does not exist.` });
  next();
};

const errorMiddleware = (app: Application) => {
  app.use('*', apiEndPointNotExistHandler);
  app.use(errorHandler);
};

export default errorMiddleware;
