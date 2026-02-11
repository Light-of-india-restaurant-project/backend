/* eslint-disable @typescript-eslint/no-explicit-any */
import { isArray, isBoolean, isEmpty, isString } from 'lodash';

export const checkIfEmpty = (value: any): boolean => isEmpty(value);
export const checkIfBoolean = (value: any): boolean => isBoolean(value);
export const checkIfString = (value: any): boolean => isString(value);
export const checkIfArray = (value: any): boolean => isArray(value);
