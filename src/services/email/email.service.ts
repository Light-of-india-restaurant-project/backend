/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

import Handlebars from 'handlebars';

import { sendEmail } from '../../utils/email';

const createHTMLToSend = (pathName: string, replacements: any): string => {
  const html = fs.readFileSync(pathName, {
    encoding: 'utf-8',
  });
  const template = Handlebars.compile(html);

  const htmlToSend = template(replacements);

  return htmlToSend;
};

const sendPasswordResetRequestEmail = async ({ email, code, url }: { email: string; code: string; url: string }): Promise<void> => {
  const subject = 'Password Reset Request';
  const resetPasswordUrl = `${url}/?email=${email}&code=${code}`;
  const message = `Please copy and paste this url [${resetPasswordUrl}] to reset your email. If you had not used the email, you can safely ignore this message.`;

  const pathName = path.join(__dirname, '../../templates/email/password-reset-email.html');
  const html = createHTMLToSend(pathName, { resetPasswordUrl, email });

  await sendEmail({
    to: email,
    subject,
    html,
    text: message,
  });
};

const sendAccountCreationEmailToUser = async ({ email, otp, url }: { email: string; otp: string; url: string }): Promise<void> => {
  const subject = 'Account Creation';
  const verificationUrl = `${url}/?email=${email}&otp=${otp}`;
  const message = `Please copy and paste this url [${verificationUrl}] to verify your email. If you had not used the email, you can safely ignore this message.`;

  const pathName = path.join(__dirname, '../../templates/email/verify-email.html');
  const html = createHTMLToSend(pathName, { verificationUrl, email });

  await sendEmail({
    to: email,
    subject,
    html,
    text: message,
  });
};

const EmailService = {
  sendPasswordResetRequestEmail,
  sendAccountCreationEmailToUser,
};

export default EmailService;
