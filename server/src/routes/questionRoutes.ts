import { Router } from 'express';
import {
  listQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  reorderQuestions,
} from '../controllers/questionController.js';
import { validate } from '../middleware/validate.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  reorderQuestionsSchema,
} from '../validation/question.js';

const router = Router({ mergeParams: true });

router.get('/', listQuestions);
router.post('/', validate(createQuestionSchema), createQuestion);
router.put('/reorder', validate(reorderQuestionsSchema), reorderQuestions);
router.get('/:questionId', getQuestionById);
router.put('/:questionId', validate(updateQuestionSchema), updateQuestion);
router.delete('/:questionId', deleteQuestion);
router.post('/:questionId/duplicate', duplicateQuestion);

export default router;
