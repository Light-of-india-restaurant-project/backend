/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from '../utils/logger';

import type { Application, Response, NextFunction, Request } from 'express';

interface CustomError extends Error {
  statusCode: number;
  message: string;
  stack: any;
}

const errorHandler: any = (err: CustomError, _req: Request, res: Response, next: NextFunction): void => {
  logger.error(err);
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
