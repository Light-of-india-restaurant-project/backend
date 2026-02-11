// import { AUTH_CONFIG } from '../../config/global.config';
// import UserService from '../../services/user.service';
// import createError from '../../utils/http.error';

// import type { CustomRequest } from '../../interfaces/auth.interface';
import { AUTH_CONFIG } from '../../config/server.config';
import { DynamicMessages, PLAIN_RESPONSE_MSG } from '../../constant/error';
import UserService from '../../services/user/user.service';

import type { CustomRequest } from '../../interfaces/auth.interface';
import type { Request, Response, NextFunction } from 'express';

const createNewUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserService.saveUser({ payload: req.body });
    res.status(201).json({
      message: DynamicMessages.createMessage('User'),
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const verifyUserAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await UserService.verifyAccount(req.body);
    res.status(200).json({
      message: PLAIN_RESPONSE_MSG.verifiedAccount,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken, accessToken } = await UserService.loginUser(req.body);
    res.cookie(AUTH_CONFIG.refreshToken, refreshToken, {
      secure: req.secure,
      sameSite: 'lax',
      httpOnly: req.secure,
      maxAge: AUTH_CONFIG.refreshTokenMaxAge,
    });
    res.status(200).json({ message: PLAIN_RESPONSE_MSG.validLogin, success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await UserService.changePassword({ userId: req.user, payload: req.body });
    res.status(200).json({
      message: DynamicMessages.updateMessage('Password'),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const passwordResetRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await UserService.passwordResetRequest(req.body);
    res.status(200).json({
      message: PLAIN_RESPONSE_MSG.passwordResetEmail,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await UserService.resetPassword(req.body);
    res.status(200).json({
      message: PLAIN_RESPONSE_MSG.passwordReset,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await UserService.getUserProfile({ userId: req.user });
    res.status(200).json({
      success: true,
      profile: profile,
    });
  } catch (error) {
    next(error);
  }
};

const UserController = {
  createNewUser,
  loginUser,
  changePassword,
  passwordResetRequest,
  resetPassword,
  verifyUserAccount,
  getUserProfile,
};

export default UserController;
