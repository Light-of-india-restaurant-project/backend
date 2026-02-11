import twilio from 'twilio';

import logger from './logger';

interface SendSMSParams {
  to: string;
  message: string;
}

export const sendSMS = async ({ to, message }: SendSMSParams): Promise<boolean> => {
  try {
    // Get Twilio configuration (in future, this will be fetched from AWS Secrets Manager)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Validate Twilio configuration
    if (!accountSid || !authToken || !fromNumber) {
      logger.error('Twilio credentials not configured. Cannot send SMS.');
      return false;
    }

    // Create Twilio client inside function for future AWS Secrets Manager integration
    const client = twilio(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });

    logger.info(`SMS sent successfully. SID: ${result.sid}`);
    return true;
  } catch (error) {
    logger.error('Error sending SMS:', error);
    return false;
  }
};

export const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP
};

export default {
  sendSMS,
  generateOTP,
};
