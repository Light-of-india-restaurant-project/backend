import { Router } from 'express';

import adminRouter from './admin.routes';
import deliveryZoneRouter from './delivery-zone.routes';
import menuRouter from './menu.routes';
import orderRouter from './order.routes';
import paymentRouter from './payment.routes';
import userRouter from './user.routes';

const v1Router = Router();

// Auth routes
v1Router.use('/users', userRouter);

// Admin routes
v1Router.use('/admin', adminRouter);

// Menu routes
v1Router.use('/menu', menuRouter);

// Order routes
v1Router.use('/orders', orderRouter);

// Payment routes
v1Router.use('/payments', paymentRouter);

// Delivery zone routes
v1Router.use('/delivery-zones', deliveryZoneRouter);

export default v1Router;
