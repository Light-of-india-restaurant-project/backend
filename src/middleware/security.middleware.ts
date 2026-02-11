import cors from 'cors';
import helmet from 'helmet';

import corsConfig from '../config/cors.config';

import type { Application } from 'express';

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(helmet());
  
  // Handle preflight requests explicitly
  app.options('*', cors(corsConfig));
  
  // Apply CORS to all routes
  app.use(cors(corsConfig));
};

export default securityMiddleware;
