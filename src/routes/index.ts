import express from 'express';

import v1Router from './v1/v1.routes';

const appRoutes = express.Router();

appRoutes.use('/v1', v1Router);
export default appRoutes;
