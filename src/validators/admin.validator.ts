import { z } from 'zod';

const adminLoginSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const adminCreateSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().trim().min(1, 'Name is required'),
  role: z.enum(['super_admin', 'admin', 'manager']).optional(),
});

const AdminValidator = {
  adminLoginSchema,
  adminCreateSchema,
};

export default AdminValidator;
