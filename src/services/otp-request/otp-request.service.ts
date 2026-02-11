import OtpRequestRepository from '../../repositories/otp-request/otp-request.repository';

import type { IOtpRequest } from '../../models/otp/otp-request.model';

const createOtpRequest = async ({ data }: { data: Partial<IOtpRequest> }): Promise<IOtpRequest> => {
  return OtpRequestRepository.createOtpRequest({ data });
};

const updateOtpRequestStatus = async ({
  id,
  status,
  verifiedAt,
}: {
  id: string;
  status: 'sent' | 'verified' | 'failed' | 'expired';
  verifiedAt?: Date;
}): Promise<IOtpRequest | null> => {
  const updateData: Partial<IOtpRequest> = { status };
  if (verifiedAt) {
    updateData.verifiedAt = verifiedAt;
  }

  return OtpRequestRepository.updateOtpRequest({ id, data: updateData });
};

const countOtpRequestsByUser = async ({
  userId,
  otpType,
  timeFrame,
}: {
  userId: string;
  otpType?: string;
  timeFrame: Date; // Count requests since this date
}): Promise<number> => {
  const condition: Record<string, unknown> = {
    user: userId,
    createdAt: { $gte: timeFrame },
  };

  if (otpType) {
    condition.otpType = otpType;
  }

  return OtpRequestRepository.countOtpRequests({ condition });
};

const getRecentOtpRequests = async ({
  userId,
  otpType,
  limit = 10,
}: {
  userId: string;
  otpType?: string;
  limit?: number;
}): Promise<IOtpRequest[]> => {
  const condition: Record<string, unknown> = { user: userId };

  if (otpType) {
    condition.otpType = otpType;
  }

  return OtpRequestRepository.findOtpRequests({
    condition,
    limit,
    sort: { createdAt: -1 },
  });
};

const getOtpRequestStats = async ({ userId, otpType }: { userId: string; otpType?: string }) => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dailyCount, weeklyCount, monthlyCount] = await Promise.all([
    countOtpRequestsByUser({ userId, otpType, timeFrame: oneDayAgo }),
    countOtpRequestsByUser({ userId, otpType, timeFrame: oneWeekAgo }),
    countOtpRequestsByUser({ userId, otpType, timeFrame: oneMonthAgo }),
  ]);

  return {
    daily: dailyCount,
    weekly: weeklyCount,
    monthly: monthlyCount,
  };
};

const OtpRequestService = {
  createOtpRequest,
  updateOtpRequestStatus,
  countOtpRequestsByUser,
  getRecentOtpRequests,
  getOtpRequestStats,
};

export default OtpRequestService;
