import helmet from 'helmet';

import corsConfig from '../config/cors.config';

import type { Application, Request, Response, NextFunction } from 'express';

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(helmet());

  // CORS handler — reflects the request origin if it is in the allowed list
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && (corsConfig.origin as string[]).includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', String(corsConfig.maxAge));
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });
};

export default securityMiddleware;
