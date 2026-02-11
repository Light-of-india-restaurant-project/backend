import { UserModel } from '../../models/user/user.model';

import type { IUser } from '../../models/user/user.model';
import type { RepositoryOptions } from '../repository.types';

const createUser = async ({ data, options }: { data: Partial<IUser>; options?: RepositoryOptions }): Promise<IUser> => {
  return UserModel.create([data], options?.session ? { session: options.session } : undefined).then((res) => res[0]);
};

const updateUser = async ({ id, data, options }: { id: string; data: Partial<IUser>; options?: RepositoryOptions }): Promise<IUser | null> => {
  return UserModel.findByIdAndUpdate(id, data, { new: true, session: options?.session });
};

const deleteUser = async ({ id, options }: { id: string; options?: RepositoryOptions }): Promise<IUser | null> => {
  return UserModel.findByIdAndDelete(id, { session: options?.session });
};

const getUserById = async ({ id, options }: { id: string; options?: RepositoryOptions }): Promise<IUser | null> => {
  return UserModel.findById(id, undefined, { session: options?.session });
};

const getAllUsers = async ({ options }: { options?: RepositoryOptions } = {}): Promise<IUser[]> => {
  return UserModel.find({}, undefined, { session: options?.session });
};

const findOne = async ({ condition, options }: { condition: object; options?: RepositoryOptions }): Promise<IUser | null> => {
  let query = UserModel.findOne(condition, undefined, {
    session: options?.session,
  });

  if (options?.populate) {
    query = query.populate(options.populate);
  }
  return query.exec();
};

const getUserByEmail = async ({ email }: { email: string }): Promise<IUser | null> => {
  return UserModel.findOne({ email });
};

const UserRepository = {
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  getUserByEmail,
  findOne,
};

export default UserRepository;
