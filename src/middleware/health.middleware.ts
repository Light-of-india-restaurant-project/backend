import { APP_NAME } from '../constant/enum';

import type { Application, Response, Request } from 'express';

const healthCheckMiddleware = (app: Application): void => {
  app.use('/health', (_req: Request, res: Response) => {
    res.status(200).json({ message: `${APP_NAME} server is healthy` });
  });
};

export default healthCheckMiddleware;
