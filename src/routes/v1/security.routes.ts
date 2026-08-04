import { Router } from 'express';

import SecurityController from '../../controllers/security/security.controller';

const securityRouter = Router();

securityRouter.get('/form-guard-token', SecurityController.getFormGuardToken);

export default securityRouter;
