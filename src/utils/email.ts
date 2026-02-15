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
}

// Use different transporter based on environment
const createTransporter = () => {
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

export const sendEmail = async ({ to, subject, html, text, attachments, from = EMAIL_CONFIG.DEFAULT_SENDER }: EmailArgs): Promise<void> => {
  try {
    if (!transporter) {
      // Development mode: log email to console
      console.log('\n========================================');
      console.log('📧 EMAIL (Development Mode)');
      console.log('========================================');
      console.log(`To: ${to}`);
      console.log(`From: ${from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${text}`);
      console.log('========================================\n');
      return;
    }
    
    await transporter.sendMail({
      to,
      subject,
      from,
      text,
      html,
      attachments,
    });
  } catch (error) {
    logger.error('Email sending failed:', error);
    // Don't throw - email failure shouldn't break the flow
  }
};
