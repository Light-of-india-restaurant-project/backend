import OtpRepository from '../../repositories/otp/otp.repository';

import type { IOtp } from '../../models/otp/otp.model';
import type { IUser } from '../../models/user/user.model';

const createOtp = async ({ data }: { data: Partial<IOtp> }) => {
  return OtpRepository.createOtp({ data });
};

const findOtp = async ({ condition }: { condition: object }) => {
  return OtpRepository.findOtp({ condition });
};

const deleteOtp = async ({ condition }: { condition: object }) => {
  return OtpRepository.deleteOtp({ condition });
};

const verifyOtp = async ({ user, otp }: { user: IUser; otp: string | number }): Promise<IOtp | null> => {
  const otpRecord = await OtpRepository.findOtp({
    condition: {
      otp,
      user: user._id,
    },
  });
  
  // Check if OTP exists and is not expired
  if (otpRecord && otpRecord.expiresAt && new Date(otpRecord.expiresAt) < new Date()) {
    // OTP has expired - delete it
    await OtpRepository.deleteOtp({ condition: { _id: otpRecord._id } });
    return null;
  }
  
  return otpRecord;
};

const countOtps = async ({ condition }: { condition: object }): Promise<number> => {
  return OtpRepository.countOtps({ condition });
};

const OtpService = {
  createOtp,
  findOtp,
  deleteOtp,
  verifyOtp,
  countOtps,
};

export default OtpService;
