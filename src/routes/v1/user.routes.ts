import { Router } from 'express';

import UserController from '../../controllers/user/user.controller';
import { validateRequestBody } from '../../middleware/validation.middleware';
import UserValidator from '../../validators/user.validator';

const userRouter = Router();

userRouter.post('/register', validateRequestBody(UserValidator.userCreateSchema), UserController.createNewUser);
userRouter.post('/verify', validateRequestBody(UserValidator.userAccountVerificationSchema), UserController.verifyUserAccount);
userRouter.post('/login', validateRequestBody(UserValidator.userLoginSchema), UserController.loginUser);
userRouter.post('/change-password', validateRequestBody(UserValidator.userPasswordChangeSchema), UserController.changePassword);
userRouter.post('/password-reset-request', validateRequestBody(UserValidator.userPasswordResetRequestSchema), UserController.passwordResetRequest);
userRouter.post('/reset-password', validateRequestBody(UserValidator.userPasswordResetSchema), UserController.resetPassword);
userRouter.get('/profile', UserController.getUserProfile);

export default userRouter;
