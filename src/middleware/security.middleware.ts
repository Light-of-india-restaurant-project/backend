import cors from 'cors';
import helmet from 'helmet';

import corsConfig from '../config/cors.config';

import type { Application } from 'express';

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors(corsConfig));
};

export default securityMiddleware;
