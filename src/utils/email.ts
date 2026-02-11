/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';

import { EMAIL_CONFIG } from '../config/server.config';

import { awsSES } from './aws';
import logger from './logger';

interface EmailArgs {
  to: string;
  subject: string;
  from?: string;
  text?: string;
  html?: any;
  attachments?: any;
}

const transporter = nodemailer.createTransport({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SES: { awsSES, aws: require('@aws-sdk/client-ses') },
});

export const sendEmail = async ({ to, subject, html, text, attachments, from = EMAIL_CONFIG.DEFAULT_SENDER }: EmailArgs): Promise<void> => {
  try {
    await transporter.sendMail({
      to,
      subject,
      from,
      text,
      html,
      attachments,
    });
  } catch (error) {
    logger.error(error);
  }
};

// transporter.verify(function (error) {
//   if (error != null) {
//     logger.error(error);
//   } else {
//     logger.info('Server is ready to take our messages');
//   }
// });
