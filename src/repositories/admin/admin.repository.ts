import { AdminModel } from '../../models/admin/admin.model';

import type { IAdmin } from '../../models/admin/admin.model';
import type { RepositoryOptions } from '../repository.types';

const createAdmin = async ({
  data,
  options,
}: {
  data: Partial<IAdmin>;
  options?: RepositoryOptions;
}): Promise<IAdmin> => {
  const admin = new AdminModel(data);
  return admin.save({ session: options?.session });
};

const updateAdmin = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IAdmin>;
  options?: RepositoryOptions;
}): Promise<IAdmin | null> => {
  return AdminModel.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

const deleteAdmin = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IAdmin | null> => {
  return AdminModel.findByIdAndDelete(id, { session: options?.session });
};

const getAdminById = async ({
  id,
  options,
}: {
  id: string;
  options?: RepositoryOptions;
}): Promise<IAdmin | null> => {
  return AdminModel.findById(id, undefined, { session: options?.session });
};

const findOne = async ({
  condition,
  options,
}: {
  condition: object;
  options?: RepositoryOptions;
}): Promise<IAdmin | null> => {
  return AdminModel.findOne(condition, undefined, { session: options?.session });
};

const getAdminByEmail = async ({ email }: { email: string }): Promise<IAdmin | null> => {
  return AdminModel.findOne({ email });
};

const AdminRepository = {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminById,
  findOne,
  getAdminByEmail,
};

export default AdminRepository;
