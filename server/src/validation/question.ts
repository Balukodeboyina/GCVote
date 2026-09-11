import { z } from 'zod';

export const QUESTION_TYPES = [
  'MULTIPLE_CHOICE',
  'POLL',
  'TRUE_FALSE',
  'RATING',
  'OPEN_TEXT',
  'WORD_CLOUD',
  'Q_AND_A',
] as const;

export const createQuestionSchema = z.object({
  type: z.enum(QUESTION_TYPES, {
    errorMap: () => ({ message: 'Invalid question type provided.' }),
  }),
  questionText: z
    .string({ required_error: 'Question prompt is required.' })
    .trim()
    .min(1, 'Question prompt cannot be empty.')
    .max(500, 'Question prompt must not exceed 500 characters.'),
  position: z.number().int().nonnegative().optional(),
  settings: z.union([z.string(), z.record(z.any())]).optional(),
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1, 'Option text cannot be empty.').max(200),
        isCorrect: z.boolean().optional().default(false),
        orderIndex: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
});

export const updateQuestionSchema = z.object({
  type: z.enum(QUESTION_TYPES).optional(),
  questionText: z
    .string()
    .trim()
    .min(1, 'Question prompt cannot be empty.')
    .max(500, 'Question prompt must not exceed 500 characters.')
    .optional(),
  position: z.number().int().nonnegative().optional(),
  settings: z.union([z.string(), z.record(z.any())]).optional(),
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().trim().min(1, 'Option text cannot be empty.').max(200),
        isCorrect: z.boolean().optional().default(false),
        orderIndex: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
});

export const reorderQuestionsSchema = z.object({
  questionIds: z
    .array(z.string(), { required_error: 'questionIds array is required.' })
    .min(1, 'At least one question ID must be provided.'),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
