import { z } from 'zod';
import { fromError } from 'zod-validation-error';

import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

const validate = (schema: ZodTypeAny, source: 'body' | 'params' | 'query'): RequestHandler => {
  return async (req, res, next) => {
    try {
      await schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errMsg = fromError(err);
        res.status(400).json({
          error: `Invalid ${source} schema`,
          message: errMsg.details.map((msg) => msg.message)[0],
        });
      } else {
        next(err);
      }
    }
  };
};

export const validateRequestBody = (schema: ZodTypeAny): RequestHandler => {
  return validate(schema, 'body');
};

export const validateRequestParams = (schema: ZodTypeAny): RequestHandler => {
  return validate(schema, 'params');
};

export const validateRequestQuery = (schema: ZodTypeAny): RequestHandler => {
  return validate(schema, 'query');
};
