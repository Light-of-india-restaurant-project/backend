import createHttpError from 'http-errors';

const createError = (statusCode: number, message: string): Error => createHttpError(statusCode, message);

export default createError;
