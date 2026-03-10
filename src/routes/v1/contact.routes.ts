import { Router } from 'express';

import ContactController from '../../controllers/contact/contact.controller';

const contactRouter = Router();

// Public endpoint - submit contact form
contactRouter.post('/', ContactController.submitContactForm);

export default contactRouter;
