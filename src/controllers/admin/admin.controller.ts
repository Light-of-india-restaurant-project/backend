import { DynamicMessages } from '../../constant/error';
import AdminService from '../../services/admin/admin.service';

import type { CustomRequest } from '../../interfaces/auth.interface';
import type { Request, Response, NextFunction } from 'express';

const loginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AdminService.loginAdmin(req.body);
    res.status(200).json({
      message: 'Login successful',
      success: true,
      token: result.token,
      admin: result.admin,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminProfile = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = await AdminService.getAdminById(req.user as string);
    res.status(200).json(admin);
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = await AdminService.createAdmin(req.body);
    res.status(201).json({
      message: DynamicMessages.createMessage('Admin'),
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const AdminController = {
  loginAdmin,
  getAdminProfile,
  createAdmin,
};

export default AdminController;
