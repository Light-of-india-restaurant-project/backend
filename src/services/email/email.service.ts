/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

import Handlebars from 'handlebars';

import { EMAIL_CONFIG } from '../../config/server.config';
import { sendEmail } from '../../utils/email';

const createHTMLToSend = (pathName: string, replacements: any): string => {
  const html = fs.readFileSync(pathName, {
    encoding: 'utf-8',
  });
  const template = Handlebars.compile(html);

  const htmlToSend = template(replacements);

  return htmlToSend;
};

const sendPasswordResetRequestEmail = async ({ email, code }: { email: string; code: string }): Promise<void> => {
  const subject = 'Password Reset - Your OTP Code';
  const message = `Your OTP code for password reset is: ${code}. This code will expire in 10 minutes. If you did not request this, please ignore this email.`;

  const pathName = path.join(__dirname, '../../templates/email/password-reset-otp.html');
  const html = createHTMLToSend(pathName, { otp: code, email });

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

// Send welcome email after registration
const sendWelcomeEmail = async ({ email, fullName }: { email: string; fullName: string }): Promise<void> => {
  const subject = 'Welcome to Light of India Restaurant!';
  const loginUrl = `${EMAIL_CONFIG.FRONTEND_URL}/login`;
  const message = `Hello ${fullName}, Welcome to Light of India Restaurant! Your account has been successfully created. Login here: ${loginUrl}`;

  const pathName = path.join(__dirname, '../../templates/email/welcome-email.html');
  const html = createHTMLToSend(pathName, { email, fullName, loginUrl });

  await sendEmail({
    to: email,
    subject,
    html,
    text: message,
  });
};

// Send order confirmation to customer
const sendOrderConfirmationEmail = async ({ 
  email, 
  orderNumber, 
  items, 
  total, 
  deliveryAddress, 
  contactMobile, 
  notes 
}: { 
  email: string; 
  orderNumber: string; 
  items: Array<{ name: string; quantity: number; price: number }>; 
  total: number;
  deliveryAddress: { streetName: string; houseNumber: string; postalCode: string; city: string };
  contactMobile: string;
  notes?: string;
}): Promise<void> => {
  const subject = `Order Confirmed - ${orderNumber}`;
  const itemsWithSubtotal = items.map(item => ({
    ...item,
    subtotal: (item.price * item.quantity).toFixed(2),
  }));
  const message = `Your order ${orderNumber} has been confirmed! Total: €${total.toFixed(2)}`;

  const pathName = path.join(__dirname, '../../templates/email/order-confirmation.html');
  const html = createHTMLToSend(pathName, { 
    email, 
    orderNumber, 
    items: itemsWithSubtotal, 
    total: total.toFixed(2), 
    deliveryAddress, 
    contactMobile, 
    notes 
  });

  await sendEmail({
    to: email,
    subject,
    html,
    text: message,
  });
};

// Send order notification to admin
const sendOrderAdminNotification = async ({ 
  email, 
  orderNumber, 
  items, 
  total, 
  deliveryAddress, 
  contactMobile, 
  notes,
  createdAt 
}: { 
  email: string; 
  orderNumber: string; 
  items: Array<{ name: string; quantity: number; price: number }>; 
  total: number;
  deliveryAddress: { streetName: string; houseNumber: string; postalCode: string; city: string };
  contactMobile: string;
  notes?: string;
  createdAt: string;
}): Promise<void> => {
  const subject = `🔔 New Order - ${orderNumber}`;
  const itemsWithSubtotal = items.map(item => ({
    ...item,
    subtotal: (item.price * item.quantity).toFixed(2),
  }));
  const message = `New order ${orderNumber} received! Total: €${total.toFixed(2)}. Customer: ${email}`;

  const pathName = path.join(__dirname, '../../templates/email/order-admin-notification.html');
  const html = createHTMLToSend(pathName, { 
    email, 
    orderNumber, 
    items: itemsWithSubtotal, 
    total: total.toFixed(2), 
    deliveryAddress, 
    contactMobile, 
    notes,
    createdAt 
  });

  await sendEmail({
    to: EMAIL_CONFIG.ADMIN_EMAIL,
    subject,
    html,
    text: message,
  });
};

// Send reservation confirmation to customer
const sendReservationConfirmationEmail = async ({ 
  email, 
  name, 
  confirmationCode, 
  date, 
  time, 
  guests, 
  tableName,
  specialRequests 
}: { 
  email: string; 
  name: string; 
  confirmationCode: string; 
  date: string; 
  time: string; 
  guests: number;
  tableName: string;
  specialRequests?: string;
}): Promise<void> => {
  const subject = `Reservation Confirmed - ${confirmationCode}`;
  const message = `Dear ${name}, Your reservation at Light of India Restaurant is confirmed! Confirmation code: ${confirmationCode}. Date: ${date}, Time: ${time}, Guests: ${guests}`;

  const pathName = path.join(__dirname, '../../templates/email/reservation-confirmation.html');
  const html = createHTMLToSend(pathName, { 
    email, 
    name, 
    confirmationCode, 
    date, 
    time, 
    guests, 
    tableName,
    specialRequests 
  });

  await sendEmail({
    to: email,
    subject,
    html,
    text: message,
  });
};

// Send reservation notification to admin
const sendReservationAdminNotification = async ({ 
  email, 
  name, 
  phone,
  confirmationCode, 
  date, 
  time, 
  guests, 
  tableName,
  specialRequests,
  createdAt 
}: { 
  email: string; 
  name: string; 
  phone: string;
  confirmationCode: string; 
  date: string; 
  time: string; 
  guests: number;
  tableName: string;
  specialRequests?: string;
  createdAt: string;
}): Promise<void> => {
  const subject = `📅 New Reservation - ${confirmationCode}`;
  const message = `New reservation! Code: ${confirmationCode}. Customer: ${name} (${email}, ${phone}). Date: ${date}, Time: ${time}, Guests: ${guests}`;

  const pathName = path.join(__dirname, '../../templates/email/reservation-admin-notification.html');
  const html = createHTMLToSend(pathName, { 
    email, 
    name, 
    phone,
    confirmationCode, 
    date, 
    time, 
    guests, 
    tableName,
    specialRequests,
    createdAt 
  });

  await sendEmail({
    to: EMAIL_CONFIG.ADMIN_EMAIL,
    subject,
    html,
    text: message,
  });
};

const EmailService = {
  sendPasswordResetRequestEmail,
  sendAccountCreationEmailToUser,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderAdminNotification,
  sendReservationConfirmationEmail,
  sendReservationAdminNotification,
};

export default EmailService;
