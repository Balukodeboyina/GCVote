import { Request, Response } from 'express';
import { prisma } from '../models/prisma.js';
import {
  CreateQuestionInput,
  UpdateQuestionInput,
  ReorderQuestionsInput,
} from '../validation/question.js';

async function verifyPresentationOwnership(presentationId: string, userId: string) {
  const presentation = await prisma.presentation.findUnique({
    where: { id: presentationId },
  });

  if (!presentation) {
    return { error: 'Presentation not found.', status: 404 as const, presentation: null };
  }

  if (presentation.ownerId !== userId) {
    return {
      error: 'You do not have permission to access this presentation.',
      status: 403 as const,
      presentation: null,
    };
  }

  return { error: null, status: 200 as const, presentation };
}

export async function listQuestions(
  req: Request<{ presentationId: string }>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { presentationId } = req.params;

    const check = await verifyPresentationOwnership(presentationId, userId);
    if (check.error) {
      res.status(check.status).json({ error: check.error });
      return;
    }

    const questions = await prisma.question.findMany({
      where: { presentationId },
      orderBy: { position: 'asc' },
      include: {
        options: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.status(200).json({ questions, total: questions.length });
  } catch (error) {
    console.error('[Question Error - List]:', error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
}

export async function createQuestion(
  req: Request<{ presentationId: string }, {}, CreateQuestionInput>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { presentationId } = req.params;
    const { type, questionText, position, settings, options } = req.body;

    const check = await verifyPresentationOwnership(presentationId, userId);
    if (check.error) {
      res.status(check.status).json({ error: check.error });
      return;
    }

    // Determine next position if not specified
    let targetPosition = position;
    if (targetPosition === undefined) {
      const lastQuestion = await prisma.question.findFirst({
        where: { presentationId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      targetPosition = lastQuestion ? lastQuestion.position + 1 : 0;
    }

    const settingsStr =
      typeof settings === 'object' ? JSON.stringify(settings) : settings || '{}';

    const question = await prisma.question.create({
      data: {
        presentationId,
        type,
        questionText,
        position: targetPosition,
        settings: settingsStr,
        ...(options && options.length > 0 && {
          options: {
            create: options.map((opt, idx) => ({
              text: opt.text,
              isCorrect: opt.isCorrect ?? false,
              orderIndex: opt.orderIndex ?? idx,
            })),
          },
        }),
      },
      include: {
        options: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.status(201).json({
      message: 'Question created successfully',
      question,
    });
  } catch (error) {
    console.error('[Question Error - Create]:', error);
    res.status(500).json({ error: 'Failed to create question.' });
  }
}

export async function getQuestionById(
  req: Request<{ presentationId: string; questionId: string }>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { presentationId, questionId } = req.params;

    const check = await verifyPresentationOwnership(presentationId, userId);
    if (check.error) {
      res.status(check.status).json({ error: check.error });
      return;
    }

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        presentationId,
      },
      include: {
        options: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found in this presentation.' });
      return;
    }

    res.status(200).json({ question });
  } catch (error) {
    console.error('[Question Error - GetById]:', error);
    res.status(500).json({ error: 'Failed to fetch question.' });
  }
}

export async function updateQuestion(
  req: Request<{ presentationId: string; questionId: string }, {}, UpdateQuestionInput>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { presentationId, questionId } = req.params;
    const { type, questionText, position, settings, options } = req.body;

    const check = await verifyPresentationOwnership(presentationId, userId);
    if (check.error) {
      res.status(check.status).json({ error: check.error });
      return;
    }

    const existing = await prisma.question.findFirst({
      where: { id: questionId, presentationId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }

    const settingsStr =
      typeof settings === 'object' ? JSON.stringify(settings) : settings;

    // Transaction to update question and synchronize options
    const updated = await prisma.$transaction(async (tx) => {
      if (options !== undefined) {
        // Delete previous options and replace with new
        await tx.option.deleteMany({
          where: { questionId },
        });

        if (options.length > 0) {
          await tx.option.createMany({
            data: options.map((opt, idx) => ({
              questionId,
              text: opt.text,
              isCorrect: opt.isCorrect ?? false,
              orderIndex: opt.orderIndex ?? idx,
            })),
          });
        }
      }

      return tx.question.update({
        where: { id: questionId },
        data: {
          ...(type && { type }),
          ...(questionText !== undefined && { questionText }),
          ...(position !== undefined && { position }),
          ...(settingsStr !== undefined && { settings: settingsStr }),
        },
        include: {
          options: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    });

    res.status(200).json({
      message: 'Question updated successfully',
      question: updated,
    });
  } catch (error) {
    console.error('[Question Error - Update]:', error);
    res.status(500).json({ error: 'Failed to update question.' });
  }
}

export async function deleteQuestion(
  req: Request<{ presentationId: string; questionId: string }>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { presentationId, questionId } = req.params;

    const check = await verifyPresentationOwnership(presentationId, userId);
    if (check.error) {
      res.status(check.status).json({ error: check.error });
      return;
    }

    const existing = await prisma.question.findFirst({
      where: { id: questionId, presentationId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Delete question (cascades to options)
      await tx.question.delete({
        where: { id: questionId },
      });

      // Normalize remaining question positions to 0, 1, 2...
      const remaining = await tx.question.findMany({
        where: { presentationId },
        orderBy: { position: 'asc' },
        select: { id: true },
      });

      for (let i = 0; i < remaining.length; i++) {
        await tx.question.update({
          where: { id: remaining[i].id },
          data: { position: i },
        });
      }
    });

    res.status(200).json({
      message: 'Question deleted successfully',
      id: questionId,
    });
  } catch (error) {
    console.error('[Question Error - Delete]:', error);
    res.status(500).json({ error: 'Failed to delete question.' });
  }
}

export async function duplicateQuestion(
  req: Request<{ presentationId: string; questionId: string }>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { presentationId, questionId } = req.params;

    const check = await verifyPresentationOwnership(presentationId, userId);
    if (check.error) {
      res.status(check.status).json({ error: check.error });
      return;
    }

    const original = await prisma.question.findFirst({
      where: { id: questionId, presentationId },
      include: {
        options: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!original) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }

    const targetPosition = original.position + 1;

    const duplicated = await prisma.$transaction(async (tx) => {
      // Shift subsequent questions forward
      await tx.question.updateMany({
        where: {
          presentationId,
          position: { gte: targetPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });

      // Create duplicated question
      return tx.question.create({
        data: {
          presentationId,
          type: original.type,
          questionText: `${original.questionText} (Copy)`,
          position: targetPosition,
          settings: original.settings,
          ...(original.options.length > 0 && {
            options: {
              create: original.options.map((opt) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                orderIndex: opt.orderIndex,
              })),
            },
          }),
        },
        include: {
          options: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    });

    res.status(201).json({
      message: 'Question duplicated successfully',
      question: duplicated,
    });
  } catch (error) {
    console.error('[Question Error - Duplicate]:', error);
    res.status(500).json({ error: 'Failed to duplicate question.' });
  }
}

export async function reorderQuestions(
  req: Request<{ presentationId: string }, {}, ReorderQuestionsInput>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { presentationId } = req.params;
    const { questionIds } = req.body;

    const check = await verifyPresentationOwnership(presentationId, userId);
    if (check.error) {
      res.status(check.status).json({ error: check.error });
      return;
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < questionIds.length; i++) {
        await tx.question.updateMany({
          where: {
            id: questionIds[i],
            presentationId,
          },
          data: {
            position: i,
          },
        });
      }
    });

    const questions = await prisma.question.findMany({
      where: { presentationId },
      orderBy: { position: 'asc' },
      include: {
        options: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.status(200).json({
      message: 'Questions reordered successfully',
      questions,
    });
  } catch (error) {
    console.error('[Question Error - Reorder]:', error);
    res.status(500).json({ error: 'Failed to reorder questions.' });
  }
}
