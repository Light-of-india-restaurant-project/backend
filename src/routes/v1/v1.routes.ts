import { Router } from 'express';

import adminRouter from './admin.routes';
import menuRouter from './menu.routes';
import userRouter from './user.routes';

const v1Router = Router();

// Auth routes
v1Router.use('/users', userRouter);

// Admin routes
v1Router.use('/admin', adminRouter);

// Menu routes
v1Router.use('/menu', menuRouter);

export default v1Router;
