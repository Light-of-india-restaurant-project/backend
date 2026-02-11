import { z } from 'zod';

const userCreateSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mobile: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid international phone number'),
  verified: z.boolean().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
});

const userUpdateSchema = z.object({
  email: z.string().trim().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  mobile: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Invalid international phone number')
    .optional(),
  verified: z.boolean().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
});

const userAccountVerificationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  otp: z.number(),
});

const userLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string({ required_error: 'Password is required' }),
});

const userPasswordChangeSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Current password is required.' }),
    newPassword: z
      .string({ required_error: 'Password is required' })
      .min(5, { message: 'Password must be at least 5 characters long' })
      .max(15, { message: 'Password must be no more than 15 characters long' }),
    confirmPassword: z.string({ required_error: 'Confirmation password is required.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const userPasswordResetRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

const userPasswordResetSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    otp: z.number(),
    newPassword: z
      .string({ required_error: 'Password is required' })
      .min(5, { message: 'Password must be at least 5 characters long' })
      .max(15, { message: 'Password must be no more than 15 characters long' }),
    confirmPassword: z.string({ required_error: 'Confirmation password is required.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const UserValidator = {
  userCreateSchema,
  userUpdateSchema,
  userAccountVerificationSchema,
  userLoginSchema,
  userPasswordChangeSchema,
  userPasswordResetRequestSchema,
  userPasswordResetSchema,
};
export default UserValidator;
