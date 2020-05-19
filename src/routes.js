import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import BruteRedis from 'express-brute-redis';
import ExpressBrute from 'express-brute';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailabilityController from './app/controllers/AvailabilityController';
import ProviderScheduleController from './app/controllers/ProviderScheduleController';

import SessionStoreValidator from './app/validators/SessionStoreValidator';
import UserStoreValidator from './app/validators/UserStoreValidator';
import UserUpdateValidator from './app/validators/UserUpdateValidator';
import AppointmentStoreValidator from './app/validators/AppointmentStoreValidator';
import ProviderScheduleStoreValidator from './app/validators/ProviderScheduleStoreValidator';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);
const store = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const bruteForce = new ExpressBrute(store);

routes.post('/users', UserStoreValidator, UserController.store);

routes.post('/sessions', bruteForce.prevent, SessionStoreValidator, SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserUpdateValidator, UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:id/availability', AvailabilityController.index);

routes.get('/providers/schedule', ProviderScheduleController.index);
routes.post('/providers/schedule', ProviderScheduleStoreValidator, ProviderScheduleController.store);

routes.post('/appointments', AppointmentStoreValidator, AppointmentController.store);
routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
