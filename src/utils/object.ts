/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, omit } from 'lodash';

export const removeKey = (obj: any, key: string): object => omit(obj, [key]);

export const getValue = (obj: any, key: string, defaultValue?: any): string => get(obj, key, defaultValue);
