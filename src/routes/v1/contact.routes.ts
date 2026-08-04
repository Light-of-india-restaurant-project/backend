import { Router } from 'express';

import ContactController from '../../controllers/contact/contact.controller';
import noCaptchaFormGuardMiddleware from '../../middleware/no-captcha-form-guard.middleware';

const contactRouter = Router();

// Public endpoint - submit contact form
contactRouter.post(
	'/',
	noCaptchaFormGuardMiddleware({
		formId: 'contact',
		emailField: 'email',
		maxAttemptsPerWindow: 6,
		windowMs: 10 * 60 * 1000,
		cooldownMs: 8000,
	}),
	ContactController.submitContactForm,
);

export default contactRouter;
