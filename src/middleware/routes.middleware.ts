import appRoutes from '../routes';

import type { Application } from 'express';

const routesMiddleware = (app: Application): void => {
  app.use('/api', appRoutes);
};

export default routesMiddleware;
