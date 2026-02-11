import crypto from 'crypto';

export const generateOtp = (length = 6): string => {
  const num = crypto.randomInt(1000000);
  const verificationCode = num.toString().padStart(length, '0');
  return verificationCode;
};

export const generateRandomString = (length: number): string =>
  crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, length); // return required number of characters

export function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
