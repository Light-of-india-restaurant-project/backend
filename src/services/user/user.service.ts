/* eslint-disable @typescript-eslint/no-explicit-any */

import { JWT_SECRET_KEY } from '../../config/server.config';
import { USER_STATUS } from '../../constant/enum';
import { DynamicMessages, PLAIN_RESPONSE_MSG } from '../../constant/error';
import UserRepository from '../../repositories/user/user.repository';
import { compareHash, generateHash } from '../../utils/bcrypt';
import { generateOtp } from '../../utils/crypto';
import createError from '../../utils/http.error';
import jwtGenerator from '../../utils/jwt.generator';
import { removeKey } from '../../utils/object';
import { checkIfEmpty } from '../../utils/validation';
import EmailService from '../email/email.service';
import OtpService from '../otp/otp.service';

import type { IUser } from '../../models/user/user.model';
import type { RepositoryOptions } from '../../repositories/repository.types';

interface JWTGenerator {
  accessToken: string;
  refreshToken: string;
}

const saveUser = async ({ payload, options }: { payload: Partial<IUser>; options?: RepositoryOptions }): Promise<any> => {
  const user = await UserRepository.findOne({ condition: { email: payload.email }, options });
  if (!checkIfEmpty(user)) {
    throw createError(409, DynamicMessages.alreadyExistMessage('User with this email'));
  }

  const userData = {
    email: payload.email,
    mobile: payload.mobile,
    password: payload.password,
    fullName: payload.fullName,
    address: payload.address,
    postalCode: payload.postalCode,
    status: 'active', // Skip verification - set as active directly
    verified: true,
  };

  const newUser = (await UserRepository.createUser({ data: userData, options })) as any;
  const response = removeKey(newUser.toJSON(), 'password');

  // Send welcome email
  EmailService.sendWelcomeEmail({
    email: newUser.email,
    fullName: newUser.fullName || 'Valued Customer',
  });
  
  return response;
};

const hasSamePassword = async (passwd: string, user: IUser): Promise<boolean> => {
  const isMatch = await compareHash(passwd, user.password);
  return isMatch;
};

const generateAuthTokens = (userId: any, time: number): JWTGenerator => {
  const accessToken = jwtGenerator.generateAccessToken(userId, JWT_SECRET_KEY.accessTokenPrivateKey, time);
  const refreshToken = jwtGenerator.generateRefreshToken(userId, JWT_SECRET_KEY.refreshTokenPrivateKey, time);
  return { accessToken, refreshToken };
};

const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<{
  refreshToken: string;
  accessToken: string;
}> => {
  const user = await UserRepository.findOne({ condition: { email: payload.email } });
  if (!user) {
    throw createError(401, PLAIN_RESPONSE_MSG.invalidAuth);
  }

  // Verification check disabled
  // if (user.status !== USER_STATUS[0]) {
  //   throw createError(401, PLAIN_RESPONSE_MSG.unVerifiedAccount);
  // }

  const authenticateUser = await hasSamePassword(payload.password, user);

  if (!authenticateUser) {
    throw createError(401, PLAIN_RESPONSE_MSG.invalidCredentials);
  }

  const { refreshToken, accessToken } = generateAuthTokens(user._id, JWT_SECRET_KEY.accessTokenMaxAge);

  return {
    refreshToken,
    accessToken,
  };
};

const changePassword = async (data: { userId: string; payload: { currentPassword: string; newPassword: string } }): Promise<void> => {
  const { userId, payload } = data;

  const user = await UserRepository.getUserById({ id: userId });
  if (!user) {
    throw createError(404, DynamicMessages.notFoundMessage('User'));
  }

  const authenticateUser = await hasSamePassword(payload.currentPassword, user);

  if (!authenticateUser) {
    throw createError(401, 'Invalid current password');
  }

  const hashPassword = await generateHash(payload.newPassword);
  const updatedData = { password: hashPassword };

  await UserRepository.updateUser({ id: userId, data: updatedData });
};

const passwordResetRequest = async (payload: { email: string }): Promise<void> => {
  const user = (await UserRepository.findOne({ condition: { email: payload.email } })) as any;
  if (!user) {
    throw createError(404, DynamicMessages.notFoundMessage('User with this email'));
  }

  // Delete any existing OTPs for this user
  await OtpService.deleteOtp({ condition: { user: user._id } });

  const otp = generateOtp();
  await OtpService.createOtp({ data: { user: user._id, otp } });

  await EmailService.sendPasswordResetRequestEmail({
    email: user.email,
    code: otp,
  });
};

const resetPassword = async (payload: { email: string; otp: string; newPassword: string }): Promise<void> => {
  const user = (await UserRepository.findOne({ condition: { email: payload.email } })) as any;
  if (!user) {
    throw createError(404, DynamicMessages.notFoundMessage('User with this email'));
  }

  const isValidOtp = await OtpService.verifyOtp({ user, otp: payload.otp });
  if (!isValidOtp) {
    throw createError(401, PLAIN_RESPONSE_MSG.invalidOtp);
  }

  const passwordHash = await generateHash(payload.newPassword);
  const updatedData = { password: passwordHash };

  await UserRepository.updateUser({ id: user._id, data: updatedData });
  OtpService.deleteOtp({ condition: { user: user._id, otp: payload.otp } });
};

const verifyAccount = async (payload: { email: string; otp: string }): Promise<void> => {
  const user = (await UserRepository.findOne({ condition: { email: payload.email } })) as any;
  if (!user) {
    throw createError(404, DynamicMessages.notFoundMessage('User with this email'));
  }

  const isValidOtp = await OtpService.verifyOtp({ user, otp: payload.otp });
  if (!isValidOtp) {
    throw createError(401, PLAIN_RESPONSE_MSG.invalidOtp);
  }

  const updatedData = { status: USER_STATUS[0], verified: true };

  await UserRepository.updateUser({ id: user._id, data: updatedData });
  OtpService.deleteOtp({ condition: { user: user._id, otp: payload.otp } });
};

const getUserInfoById = async (id: string) => {
  const user = await UserRepository.getUserById({
    id: id,
  });
  return user;
};

const getUserProfile = async (data: { userId: string }): Promise<any> => {
  const user = await UserRepository.findOne({
    condition: {
      _id: data.userId,
    },
  });
  return user;
};

const findByEmail = async ({ email }: { email: string }) => {
  return UserRepository.getUserByEmail({ email });
};

const UserService = {
  saveUser,
  loginUser,
  changePassword,
  passwordResetRequest,
  resetPassword,
  verifyAccount,
  getUserInfoById,
  getUserProfile,
  findByEmail,
};

export default UserService;
