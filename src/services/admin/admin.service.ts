import { JWT_SECRET_KEY } from '../../config/server.config';
import { DynamicMessages, PLAIN_RESPONSE_MSG } from '../../constant/error';
import AdminRepository from '../../repositories/admin/admin.repository';
import { compareHash } from '../../utils/bcrypt';
import createError from '../../utils/http.error';
import jwtGenerator from '../../utils/jwt.generator';

import type { IAdmin } from '../../models/admin/admin.model';

interface JWTGenerator {
  accessToken: string;
  refreshToken: string;
}

const hasSamePassword = async (passwd: string, admin: IAdmin): Promise<boolean> => {
  const isMatch = await compareHash(passwd, admin.password);
  return isMatch;
};

const generateAuthTokens = (adminId: string, time: number): JWTGenerator => {
  const accessToken = jwtGenerator.generateAccessToken(adminId, JWT_SECRET_KEY.accessTokenPrivateKey, time);
  const refreshToken = jwtGenerator.generateRefreshToken(adminId, JWT_SECRET_KEY.refreshTokenPrivateKey, time);
  return { accessToken, refreshToken };
};

const loginAdmin = async (payload: {
  email: string;
  password: string;
}): Promise<{
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}> => {
  const admin = await AdminRepository.findOne({ condition: { email: payload.email } });
  if (!admin) {
    throw createError(401, PLAIN_RESPONSE_MSG.invalidAuth);
  }

  if (!admin.isActive) {
    throw createError(401, 'Admin account is disabled');
  }

  const authenticateAdmin = await hasSamePassword(payload.password, admin);

  if (!authenticateAdmin) {
    throw createError(401, PLAIN_RESPONSE_MSG.invalidCredentials);
  }

  const { accessToken } = generateAuthTokens(admin._id as string, JWT_SECRET_KEY.accessTokenMaxAge);

  return {
    token: accessToken,
    admin: {
      id: admin._id as string,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  };
};

const getAdminById = async (adminId: string): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
}> => {
  const admin = await AdminRepository.getAdminById({ id: adminId });
  if (!admin) {
    throw createError(404, DynamicMessages.notFoundMessage('Admin'));
  }

  return {
    id: admin._id as string,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
};

const createAdmin = async (payload: {
  email: string;
  password: string;
  name: string;
  role?: string;
}): Promise<IAdmin> => {
  const existingAdmin = await AdminRepository.findOne({ condition: { email: payload.email } });
  if (existingAdmin) {
    throw createError(409, DynamicMessages.alreadyExistMessage('Admin with this email'));
  }

  const admin = await AdminRepository.createAdmin({
    data: {
      email: payload.email,
      password: payload.password,
      name: payload.name,
      role: payload.role || 'admin',
    },
  });

  return admin;
};

const AdminService = {
  loginAdmin,
  getAdminById,
  createAdmin,
};

export default AdminService;
