/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Request } from 'express';

export interface CustomRequest extends Request {
  user?: any;
  role?: string; // Add your role type here if needed
  permissions?: string[];
}
