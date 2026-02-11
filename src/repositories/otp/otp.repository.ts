import { OtpModel } from '../../models/otp/otp.model';

import type { IOtp } from '../../models/otp/otp.model';
import type { RepositoryOptions } from '../repository.types';

const createOtp = async ({ data, options }: { data: Partial<IOtp>; options?: RepositoryOptions }): Promise<IOtp> => {
  return OtpModel.create([data], options?.session ? { session: options.session } : undefined).then((res) => res[0]);
};

const findOtp = async ({ condition, options }: { condition: object; options?: RepositoryOptions }): Promise<IOtp | null> => {
  return OtpModel.findOne(condition, undefined, { session: options?.session });
};

const deleteOtp = async ({ condition, options }: { condition: object; options?: RepositoryOptions }): Promise<{ deletedCount?: number }> => {
  return OtpModel.deleteOne(condition, options?.session ? { session: options.session } : undefined);
};

const countOtps = async ({ condition, options }: { condition: object; options?: RepositoryOptions }): Promise<number> => {
  return OtpModel.countDocuments(condition, options?.session ? { session: options.session } : undefined);
};

const OtpRepository = {
  createOtp,
  findOtp,
  deleteOtp,
  countOtps,
};

export default OtpRepository;
