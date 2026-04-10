import cors from 'cors';
import helmet from 'helmet';

import corsConfig from '../config/cors.config';

import type { Application, Request, Response, NextFunction } from 'express';

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(helmet());

  // Raw CORS handler — guarantees headers on every response regardless of downstream middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && corsConfig.origin.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', String(corsConfig.maxAge));
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });
  
  // Handle preflight requests explicitly
  app.options('*', cors(corsConfig));
  
  // Apply CORS to all routes
  app.use(cors(corsConfig));
};

export default securityMiddleware;
