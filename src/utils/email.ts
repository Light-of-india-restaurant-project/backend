/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';

import { EMAIL_CONFIG } from '../config/server.config';

import logger from './logger';

interface EmailArgs {
  to: string;
  subject: string;
  from?: string;
  text?: string;
  html?: any;
  attachments?: any;
  bcc?: string;
}

export interface EmailSendResult {
  ok: boolean;
  provider: 'brevo' | 'gmail' | 'ses' | 'none';
  messageId?: string;
  error?: string;
}

const getEmailProvider = (): 'brevo' | 'gmail' | 'ses' | 'none' => {
  if (process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) return 'gmail';
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) return 'ses';
  return 'none';
};

// Use different transporter based on environment
const createTransporter = () => {
  // Brevo SMTP (recommended for production)
  if (process.env.BREVO_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_LOGIN || process.env.EMAIL_FROM || 'noreply@lightofindia.nl',
        pass: process.env.BREVO_API_KEY,
      },
    });
  }

  // Gmail SMTP (recommended for development)
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  // AWS SES (for production)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      const { SES } = require('@aws-sdk/client-ses');
      const { defaultProvider } = require('@aws-sdk/credential-provider-node');
      
      const awsSES = new SES({
        apiVersion: '2010-12-01',
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: defaultProvider(),
      });
      
      return nodemailer.createTransport({
        SES: { ses: awsSES, aws: require('@aws-sdk/client-ses') },
      });
    } catch (error) {
      logger.warn('AWS SES not configured');
    }
  }
  
  // Fallback: log to console
  return null;
};

const transporter = createTransporter();
const emailProvider = getEmailProvider();

export const verifyEmailTransporter = async (): Promise<void> => {
  if (!transporter) {
    logger.warn(`Email provider unavailable. provider=${emailProvider}`);
    return;
  }

  try {
    await transporter.verify();
    logger.info(`Email transporter verified successfully. provider=${emailProvider}`);
  } catch (error: any) {
    logger.error(`Email transporter verification failed. provider=${emailProvider} error=${error?.message || 'unknown'}`);
  }
};

export const sendEmail = async ({ to, subject, html, text, attachments, from = EMAIL_CONFIG.DEFAULT_SENDER, bcc }: EmailArgs): Promise<EmailSendResult> => {
  try {
    if (!transporter) {
      logger.error(`Email not sent: transporter unavailable. provider=${emailProvider} to=${to} subject=${subject}`);
      return {
        ok: false,
        provider: emailProvider,
        error: 'Email transporter is not configured',
      };
    }
    
    const info = await transporter.sendMail({
      to,
      subject,
      from,
      text,
      html,
      attachments,
      bcc,
    });

    return {
      ok: true,
      provider: emailProvider,
      messageId: info?.messageId,
    };
  } catch (error) {
    logger.error('Email sending failed:', {
      provider: emailProvider,
      to,
      subject,
      error,
    });

    return {
      ok: false,
      provider: emailProvider,
      error: error instanceof Error ? error.message : 'Unknown email error',
    };
  }
};
