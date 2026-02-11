/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ClientSession } from 'mongoose';

export interface RepositoryOptions {
  session?: ClientSession;
  populate?: any;
  select?: string[]; // Array of field names to select
  skip?: number;
  limit?: number;
  sort?: any;
}
