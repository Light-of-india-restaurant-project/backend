import { createFormGuardToken } from '../../utils/form-guard';

import type { Request, Response, NextFunction } from 'express';

const ALLOWED_FORMS = new Set(['contact', 'simple-reservation', 'breakfast-reservation']);

const getFormGuardToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const form = typeof req.query.form === 'string' ? req.query.form.trim() : '';

    if (!ALLOWED_FORMS.has(form)) {
      res.status(400).json({
        success: false,
        message: 'Invalid form id',
      });
      return;
    }

    const { token, expiresInMs } = createFormGuardToken({ form });

    res.status(200).json({
      success: true,
      data: {
        token,
        expiresInMs,
      },
    });
  } catch (error) {
    next(error);
  }
};

const SecurityController = {
  getFormGuardToken,
};

export default SecurityController;
