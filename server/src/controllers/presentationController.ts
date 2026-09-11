import { Request, Response } from 'express';
import { prisma } from '../models/prisma.js';
import { CreatePresentationInput, UpdatePresentationInput } from '../validation/presentation.js';

export async function createPresentation(
  req: Request<{}, {}, CreatePresentationInput>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { title, description } = req.body;

    const presentation = await prisma.presentation.create({
      data: {
        title,
        description: description || null,
        ownerId: userId,
      },
    });

    res.status(201).json({
      message: 'Presentation created successfully',
      presentation,
    });
  } catch (error) {
    console.error('[Presentation Error - Create]:', error);
    res.status(500).json({ error: 'Failed to create presentation.' });
  }
}

export async function listPresentations(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const presentations = await prisma.presentation.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({
      presentations,
      total: presentations.length,
    });
  } catch (error) {
    console.error('[Presentation Error - List]:', error);
    res.status(500).json({ error: 'Failed to fetch presentations.' });
  }
}

export async function getPresentationById(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const presentation = await prisma.presentation.findUnique({
      where: { id },
    });

    if (!presentation) {
      res.status(404).json({ error: 'Presentation not found.' });
      return;
    }

    // Security check: ensure user owns this presentation
    if (presentation.ownerId !== userId) {
      res.status(403).json({ error: 'You do not have permission to access this presentation.' });
      return;
    }

    res.status(200).json({ presentation });
  } catch (error) {
    console.error('[Presentation Error - GetById]:', error);
    res.status(500).json({ error: 'Failed to fetch presentation.' });
  }
}

export async function updatePresentation(
  req: Request<{ id: string }, {}, UpdatePresentationInput>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, description } = req.body;

    const existing = await prisma.presentation.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Presentation not found.' });
      return;
    }

    // Security check: ensure user owns this presentation
    if (existing.ownerId !== userId) {
      res.status(403).json({ error: 'You do not have permission to update this presentation.' });
      return;
    }

    const updated = await prisma.presentation.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });

    res.status(200).json({
      message: 'Presentation updated successfully',
      presentation: updated,
    });
  } catch (error) {
    console.error('[Presentation Error - Update]:', error);
    res.status(500).json({ error: 'Failed to update presentation.' });
  }
}

export async function deletePresentation(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.presentation.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Presentation not found.' });
      return;
    }

    // Security check: ensure user owns this presentation
    if (existing.ownerId !== userId) {
      res.status(403).json({ error: 'You do not have permission to delete this presentation.' });
      return;
    }

    await prisma.presentation.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Presentation deleted successfully',
      id,
    });
  } catch (error) {
    console.error('[Presentation Error - Delete]:', error);
    res.status(500).json({ error: 'Failed to delete presentation.' });
  }
}
