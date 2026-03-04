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

// ==================== SIMPLE RESERVATION EMAILS ====================

interface SimpleReservationEmailData {
  name: string;
  email: string;
  contactNumber: string;
  numberOfGuests: number;
  reservationDate: string;
  reservationId?: string;
}

// Send confirmation email to customer when reservation request is received
const sendSimpleReservationReceivedEmail = async (data: SimpleReservationEmailData): Promise<void> => {
  const subject = 'Reservation Request Received - Light of India';
  const message = `Dear ${data.name}, thank you for your reservation request for ${data.reservationDate}. We will review it and get back to you shortly.`;

  const pathName = path.join(__dirname, '../../templates/email/simple-reservation-received.html');
  const html = createHTMLToSend(pathName, data);

  await sendEmail({
    to: data.email,
    subject,
    html,
    text: message,
  });
};

// Send email to customer when reservation is accepted
const sendSimpleReservationAcceptedEmail = async (data: SimpleReservationEmailData): Promise<void> => {
  const subject = '✅ Reservation Confirmed - Light of India';
  const message = `Dear ${data.name}, great news! Your reservation for ${data.reservationDate} has been confirmed. We look forward to seeing you!`;

  const pathName = path.join(__dirname, '../../templates/email/simple-reservation-accepted.html');
  const html = createHTMLToSend(pathName, data);

  await sendEmail({
    to: data.email,
    subject,
    html,
    text: message,
  });
};

// Send email to customer when reservation is rejected
const sendSimpleReservationRejectedEmail = async (data: SimpleReservationEmailData & { rejectionReason: string }): Promise<void> => {
  const subject = 'Reservation Update - Light of India';
  const message = `Dear ${data.name}, we regret to inform you that we were unable to confirm your reservation for ${data.reservationDate}. Reason: ${data.rejectionReason}`;

  const pathName = path.join(__dirname, '../../templates/email/simple-reservation-rejected.html');
  const html = createHTMLToSend(pathName, data);

  await sendEmail({
    to: data.email,
    subject,
    html,
    text: message,
  });
};

// Send email to customer when reservation is cancelled
const sendSimpleReservationCancelledEmail = async (data: SimpleReservationEmailData & { cancellationReason: string }): Promise<void> => {
  const subject = 'Reservation Cancelled - Light of India';
  const message = `Dear ${data.name}, your reservation for ${data.reservationDate} has been cancelled. Reason: ${data.cancellationReason}`;

  const pathName = path.join(__dirname, '../../templates/email/simple-reservation-cancelled.html');
  const html = createHTMLToSend(pathName, data);

  await sendEmail({
    to: data.email,
    subject,
    html,
    text: message,
  });
};

// Send notification to admin when new reservation request is received
const sendSimpleReservationAdminNotification = async (data: SimpleReservationEmailData & { createdAt: string }): Promise<void> => {
  const subject = `🔔 New Reservation Request - ${data.name}`;
  const message = `New reservation request from ${data.name} for ${data.reservationDate} (${data.numberOfGuests} guests). Phone: ${data.contactNumber}`;
  const adminUrl = `${EMAIL_CONFIG.ADMIN_URL || 'http://localhost:5173'}/simple-reservations/${data.reservationId}`;

  const pathName = path.join(__dirname, '../../templates/email/simple-reservation-admin-notification.html');
  const html = createHTMLToSend(pathName, { ...data, adminUrl });

  await sendEmail({
    to: EMAIL_CONFIG.ADMIN_EMAIL,
    subject,
    html,
    text: message,
  });
};

// ============ CATERING EMAILS ============

interface CateringOrderEmailData {
  orderId: string;
  orderNumber: string;
  packName: string;
  category: string;
  categoryDisplay: string;
  menuItems: Array<{ name: string }>;
  peopleCount: number;
  pricePerPerson: string;
  totalPrice: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: {
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    additionalInfo?: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

// Send catering order confirmation to customer
const sendCateringOrderConfirmation = async (data: CateringOrderEmailData): Promise<void> => {
  const subject = `Catering Order Confirmed - ${data.orderNumber}`;
  const message = `Dear ${data.customerName}, your catering order ${data.orderNumber} has been confirmed! Pack: ${data.packName}, People: ${data.peopleCount}, Total: €${data.totalPrice}. Delivery: ${data.deliveryDate} at ${data.deliveryTime}.`;

  const pathName = path.join(__dirname, '../../templates/email/catering-order-confirmation.html');
  const html = createHTMLToSend(pathName, data);

  await sendEmail({
    to: data.customerEmail,
    subject,
    html,
    text: message,
  });
};

// Send catering order notification to admin
const sendCateringOrderAdminNotification = async (data: CateringOrderEmailData & { orderDate: string }): Promise<void> => {
  const subject = `🍽️ New Catering Order - ${data.orderNumber} (${data.peopleCount} people)`;
  const message = `New catering order ${data.orderNumber} from ${data.customerName}. Pack: ${data.packName}, People: ${data.peopleCount}, Total: €${data.totalPrice}. Delivery: ${data.deliveryDate} at ${data.deliveryTime}.`;
  const adminUrl = EMAIL_CONFIG.ADMIN_URL || 'http://localhost:5173';

  const pathName = path.join(__dirname, '../../templates/email/catering-order-admin-notification.html');
  const html = createHTMLToSend(pathName, { ...data, adminUrl });

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
  // Simple Reservation emails
  sendSimpleReservationReceivedEmail,
  sendSimpleReservationAcceptedEmail,
  sendSimpleReservationRejectedEmail,
  sendSimpleReservationCancelledEmail,
  sendSimpleReservationAdminNotification,
  // Catering emails
  sendCateringOrderConfirmation,
  sendCateringOrderAdminNotification,
};

export default EmailService;
