import compression from 'compression';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

import type { Application } from 'express';

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(cookieParser());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

export default standardMiddleware;
