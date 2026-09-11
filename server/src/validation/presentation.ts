import { z } from 'zod';

export const createPresentationSchema = z.object({
  title: z
    .string({ required_error: 'Presentation title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .nullable(),
});

export const updatePresentationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .nullable(),
});

export type CreatePresentationInput = z.infer<typeof createPresentationSchema>;
export type UpdatePresentationInput = z.infer<typeof updatePresentationSchema>;
