import { OtpRequestModel } from '../../models/otp/otp-request.model';

import type { IOtpRequest } from '../../models/otp/otp-request.model';
import type { RepositoryOptions } from '../repository.types';

const createOtpRequest = async ({ data, options }: { data: Partial<IOtpRequest>; options?: RepositoryOptions }): Promise<IOtpRequest> => {
  return OtpRequestModel.create([data], options?.session ? { session: options.session } : undefined).then((res) => res[0]);
};

const findOtpRequest = async ({ condition, options }: { condition: object; options?: RepositoryOptions }): Promise<IOtpRequest | null> => {
  return OtpRequestModel.findOne(condition, undefined, { session: options?.session });
};

const updateOtpRequest = async ({
  id,
  data,
  options,
}: {
  id: string;
  data: Partial<IOtpRequest>;
  options?: RepositoryOptions;
}): Promise<IOtpRequest | null> => {
  return OtpRequestModel.findByIdAndUpdate(id, data, {
    new: true,
    session: options?.session,
  });
};

const countOtpRequests = async ({ condition, options }: { condition: object; options?: RepositoryOptions }): Promise<number> => {
  return OtpRequestModel.countDocuments(condition, options?.session ? { session: options.session } : undefined);
};

const findOtpRequests = async ({
  condition,
  options,
  limit,
  sort,
}: {
  condition: object;
  options?: RepositoryOptions;
  limit?: number;
  sort?: { [key: string]: 1 | -1 };
}): Promise<IOtpRequest[]> => {
  const query = OtpRequestModel.find(condition, undefined, { session: options?.session });

  if (sort) {
    query.sort(sort);
  }

  if (limit) {
    query.limit(limit);
  }

  return query.exec();
};

const deleteOtpRequest = async ({ condition, options }: { condition: object; options?: RepositoryOptions }): Promise<{ deletedCount?: number }> => {
  return OtpRequestModel.deleteOne(condition, options?.session ? { session: options.session } : undefined);
};

const OtpRequestRepository = {
  createOtpRequest,
  findOtpRequest,
  updateOtpRequest,
  countOtpRequests,
  findOtpRequests,
  deleteOtpRequest,
};

export default OtpRequestRepository;
