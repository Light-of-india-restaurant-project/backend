import http from 'http';

import 'dotenv/config';

import { APP_NAME } from './constant/enum';
import errorMiddleware from './middleware/error.middleware';
import healthCheckMiddleware from './middleware/health.middleware';
import routesMiddleware from './middleware/routes.middleware';
import securityMiddleware from './middleware/security.middleware';
import standardMiddleware from './middleware/standard.middleware';
import log, { requestLogger } from './utils/logger';

import type { Application } from 'express';

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);

    // Logging server information
    log.info(`${APP_NAME} server has started with process id ${process.pid}`);
    httpServer.listen(process.env.PORT, () => {
      log.info(`${APP_NAME} server running on port ${process.env.PORT}`);
      log.info(`${APP_NAME} server url: http://localhost:${process.env.PORT}`);
    });

    // Handling graceful Shutdown
    process.on('SIGTERM', () => {
      log.info('SIGTERM received. Closing server...');
      httpServer.close(() => log.info('Server closed.'));
    });

    process.on('SIGINT', () => {
      log.info('SIGINT received. Closing server...');
      httpServer.close(() => log.info('Server closed.'));
    });
  } catch (error) {
    log.error(`${APP_NAME} startServer() method error:`, error);
  }
};

export function startApp(app: Application): void {
  securityMiddleware(app);
  standardMiddleware(app);
  app.use(requestLogger);
  routesMiddleware(app);
  healthCheckMiddleware(app);
  startServer(app);
  errorMiddleware(app);
}
