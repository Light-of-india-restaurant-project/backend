import { z } from 'zod';

// MongoDB ObjectId validation (24 hex characters)
const mongoIdValidation = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const paramsValidationSchema = z.object({
  id: mongoIdValidation,
});

const userParamsValidationSchema = z.object({
  userId: mongoIdValidation,
});

const CommonValidator = {
  paramsValidationSchema,
  userParamsValidationSchema,
  mongoIdValidation,
};
export default CommonValidator;
