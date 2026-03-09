import { Router } from 'express';

import OfferController from '../../controllers/offer/offer.controller';
import { validateRequestBody, validateRequestParams } from '../../middleware/validation.middleware';
import CommonValidator from '../../validators/common.validators';
import OfferValidator from '../../validators/offer.validator';

const offerRouter = Router();

// ==================== Public Routes ====================
offerRouter.get('/active', OfferController.getActiveOffers);

// ==================== Admin Routes ====================
offerRouter.get('/', OfferController.getAllOffers);
offerRouter.get('/:id', validateRequestParams(CommonValidator.paramsValidationSchema), OfferController.getOfferById);
offerRouter.post('/', validateRequestBody(OfferValidator.offerCreateSchema), OfferController.createOffer);
offerRouter.put(
  '/:id',
  validateRequestParams(CommonValidator.paramsValidationSchema),
  validateRequestBody(OfferValidator.offerUpdateSchema),
  OfferController.updateOffer,
);
offerRouter.delete('/:id', validateRequestParams(CommonValidator.paramsValidationSchema), OfferController.deleteOffer);

export default offerRouter;
