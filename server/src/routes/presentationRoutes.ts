import { Router } from 'express';
import {
  createPresentation,
  listPresentations,
  getPresentationById,
  updatePresentation,
  deletePresentation,
} from '../controllers/presentationController.js';
import { validate } from '../middleware/validate.js';
import { createPresentationSchema, updatePresentationSchema } from '../validation/presentation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All presentation routes require authentication
router.use(requireAuth);

router.get('/', listPresentations);
router.post('/', validate(createPresentationSchema), createPresentation);
router.get('/:id', getPresentationById);
router.put('/:id', validate(updatePresentationSchema), updatePresentation);
router.delete('/:id', deletePresentation);

export default router;
